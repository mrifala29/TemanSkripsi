"""
DEPRECATED — moved to agents/analisis_agent.py

AnalisisService has been replaced by AnalisisAgent which uses LangChain LCEL.
See agents/analisis_agent.py for the current implementation.
"""

import json
import logging
import re

import google.generativeai as genai
from supabase import Client

from rag import retrieve_chunks, chunks_to_context
from prompts.loader import PromptLoader
from schemas import AnalysisRequest, AnalysisResponse, AnalysisScoreItem

log = logging.getLogger(__name__)

CHAT_MODEL = "gemini-1.5-flash"

ASPECT_CODE_MAP: dict[str, str] = {
    "Kejelasan Latar Belakang":        "latar_belakang",
    "Rumusan Masalah & Tujuan":        "rumusan_masalah",
    "Kekuatan Metodologi":             "metodologi",
    "Kualitas Analisis & Pembahasan":  "analisis_pembahasan",
    "Konsistensi Pembahasan":          "konsistensi",
    "Kualitas Kesimpulan":             "kesimpulan",
}


class AnalisisService:
    def __init__(self, supabase: Client, model_name: str = CHAT_MODEL):
        self.supabase = supabase
        self.model = genai.GenerativeModel(model_name)
        self.loader = PromptLoader()

    def run(self, req: AnalysisRequest) -> AnalysisResponse:
        ctx = req.context

        # 1. Retrieve relevant chunks via RAG (query = thesis title for broad coverage)
        chunks = retrieve_chunks(
            supabase=self.supabase,
            document_id=ctx.document_id,
            query=ctx.judul_skripsi,
            genai=genai,
            top_k=12,
        )
        chunks_context = chunks_to_context(chunks)

        # 2. Build per-jurusan prompt
        prompt = self.loader.build_prompt(
            service="analisis",
            major=ctx.major,
            jurusan=ctx.jurusan,
            variables={
                "judul_skripsi": ctx.judul_skripsi,
                "chunks_context": chunks_context,
            },
        )

        # 3. Call Gemini
        response = self.model.generate_content(prompt)
        raw = response.text.strip()

        # 4. Parse JSON (strip markdown code fences if present)
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        if not match:
            raise ValueError(f"AI response tidak mengandung JSON valid:\n{raw[:400]}")
        data = json.loads(match.group())

        # 5. Map to response schema
        scores: list[AnalysisScoreItem] = []
        for s in data.get("scores", []):
            aspect_display: str = s.get("aspect", "")
            aspect_code = ASPECT_CODE_MAP.get(
                aspect_display,
                aspect_display.lower().replace(" ", "_").replace("&", "dan"),
            )
            scores.append(
                AnalysisScoreItem(
                    aspect=aspect_code,
                    aspect_display=aspect_display,
                    score=float(s.get("score", 0)),
                    feedback=s.get("feedback", ""),
                )
            )

        result = AnalysisResponse(
            overall_score=float(data.get("overall", 0)),
            summary=data.get("summary", ""),
            scores=scores,
            weaknesses=data.get("weaknesses", []),
            suggestions=data.get("suggestions", []),
            potential_questions=data.get("potential_questions", []),
        )

        # 6. Persist to DB
        self._save_to_db(req.analysis_id, result)

        return result

    # ──────────────────────────────────────────
    # Private helpers
    # ──────────────────────────────────────────

    def _save_to_db(self, analysis_id: str, result: AnalysisResponse) -> None:
        """Store per-aspect scores and update the analysis record status."""
        rows = [
            {
                "analysis_id": analysis_id,
                "aspect": s.aspect,
                "score": s.score,
                "notes": s.feedback,
            }
            for s in result.scores
        ]
        if rows:
            self.supabase.table("analysis_scores").insert(rows).execute()

        self.supabase.table("analyses").update(
            {
                "overall_score": result.overall_score,
                "summary": result.summary,
                "status": "done",
            }
        ).eq("id", analysis_id).execute()

        log.info("Analysis %s saved to DB (overall=%.1f)", analysis_id, result.overall_score)

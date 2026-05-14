"""
Analysis Agent — scores a thesis across 6 academic aspects.

Flow:
  1. RAG: retrieve top-k chunks using thesis title as query
  2. Build 3-layer prompt (system + fakultas + service task)
  3. LangChain LCEL chain: LLM → JsonOutputParser → typed response
  4. Persist scores to analysis_scores + update analyses record
"""
from __future__ import annotations

import logging

from langchain_core.messages import HumanMessage
from langchain_core.output_parsers import JsonOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from supabase import Client

from core.config import settings
from prompts.loader import PromptLoader
from rag.retriever import chunks_to_context, retrieve_chunks
from schemas.requests import AnalysisRequest
from schemas.responses import AnalysisResponse, AnalysisScoreItem

log = logging.getLogger(__name__)

# Maps AI-generated display names to the aspect codes stored in the DB
ASPECT_CODE_MAP: dict[str, str] = {
    "Kejelasan Latar Belakang":        "latar_belakang",
    "Rumusan Masalah & Tujuan":        "rumusan_masalah",
    "Kekuatan Metodologi":             "metodologi",
    "Kualitas Analisis & Pembahasan":  "analisis_pembahasan",
    "Konsistensi Pembahasan":          "konsistensi",
    "Kualitas Kesimpulan":             "kesimpulan",
}


class AnalisisAgent:
    """
    LangChain-powered agent for thesis analysis and scoring.

    Instantiate with concrete dependencies (injected in main.py):
        agent = AnalisisAgent(get_supabase(), get_llm(), get_embeddings())
    """

    def __init__(
        self,
        supabase: Client,
        llm: ChatGoogleGenerativeAI,
        embeddings: GoogleGenerativeAIEmbeddings,
    ):
        self.supabase   = supabase
        self.embeddings = embeddings
        self.loader     = PromptLoader()
        # LCEL chain: LLM → JSON dict
        self.chain = llm | JsonOutputParser()

    # ──────────────────────────────────────────────────────────────────────
    # Public API
    # ──────────────────────────────────────────────────────────────────────

    def run(self, req: AnalysisRequest) -> AnalysisResponse:
        ctx = req.context

        # 1. RAG — broad retrieval using thesis title
        chunks = retrieve_chunks(
            supabase=self.supabase,
            document_id=ctx.document_id,
            query=ctx.judul_skripsi,
            embeddings=self.embeddings,
            top_k=settings.rag_top_k_analysis,
        )

        # 2. Build prompt
        prompt = self.loader.build_prompt(
            service="analisis",
            major=ctx.major,
            jurusan=ctx.jurusan,
            variables={
                "judul_skripsi":  ctx.judul_skripsi,
                "chunks_context": chunks_to_context(chunks),
            },
        )

        # 3. Invoke chain → parsed dict
        data: dict = self.chain.invoke([HumanMessage(content=prompt)])

        # 4. Build typed response
        scores = [
            AnalysisScoreItem(
                aspect=ASPECT_CODE_MAP.get(
                    s["aspect"],
                    s["aspect"].lower().replace(" ", "_").replace("&", "dan"),
                ),
                aspect_display=s["aspect"],
                score=float(s.get("score", 0)),
                feedback=s.get("feedback", ""),
            )
            for s in data.get("scores", [])
        ]

        result = AnalysisResponse(
            overall_score=float(data.get("overall", 0)),
            summary=data.get("summary", ""),
            scores=scores,
            weaknesses=data.get("weaknesses", []),
            suggestions=data.get("suggestions", []),
            potential_questions=data.get("potential_questions", []),
        )

        # 5. Persist
        self._save(req.analysis_id, result)
        return result

    # ──────────────────────────────────────────────────────────────────────
    # Private helpers
    # ──────────────────────────────────────────────────────────────────────

    def _save(self, analysis_id: str, result: AnalysisResponse) -> None:
        rows = [
            {
                "analysis_id": analysis_id,
                "aspect":      s.aspect,
                "score":       s.score,
                "notes":       s.feedback,
            }
            for s in result.scores
        ]
        if rows:
            self.supabase.table("analysis_scores").insert(rows).execute()

        self.supabase.table("analyses").update(
            {
                "overall_score": result.overall_score,
                "summary":       result.summary,
                "status":        "done",
            }
        ).eq("id", analysis_id).execute()

        log.info("Analysis %s saved (overall=%.1f)", analysis_id, result.overall_score)

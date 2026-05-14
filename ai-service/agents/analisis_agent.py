"""
Analysis Agent — scores a thesis per chapter (BAB).

Flow:
  1. RAG: retrieve top-k chunks using thesis title as query
  2. Build 3-layer prompt (system + fakultas + service task)
  3. LangChain LCEL chain: LLM → JsonOutputParser → typed response
  4. Persist per-bab scores to analysis_scores + update analyses record
"""
from __future__ import annotations

import logging
from typing import Optional

from langchain_core.messages import HumanMessage
from langchain_core.output_parsers import JsonOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from supabase import Client

from core.config import settings
from prompts.loader import PromptLoader
from rag.retriever import chunks_to_context, retrieve_chunks
from schemas.requests import AnalysisRequest
from schemas.responses import AnalysisResponse, BabAnalysis

log = logging.getLogger(__name__)


class AnalisisAgent:
    """
    LangChain-powered agent for per-chapter thesis analysis and scoring.

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
        """Run analysis from document already stored in Supabase (production path)."""
        ctx = req.context

        # 1. RAG — broad retrieval using thesis title
        chunks = retrieve_chunks(
            supabase=self.supabase,
            document_id=ctx.document_id,
            query=ctx.judul_skripsi,
            embeddings=self.embeddings,
            top_k=settings.rag_top_k_analysis,
        )

        result = self._invoke(
            major=ctx.major,
            jurusan=ctx.jurusan,
            judul_skripsi=ctx.judul_skripsi,
            chunks_context=chunks_to_context(chunks),
        )

        # 2. Persist
        self._save(req.analysis_id, result)
        return result

    def run_from_text(
        self,
        text: str,
        major: str,
        jurusan: str,
        judul_skripsi: str,
        analysis_id: Optional[str] = None,
    ) -> AnalysisResponse:
        """
        Run analysis directly from extracted text — no RAG DB lookup.
        Used by the /documents/analyze endpoint (Swagger + production upload path).
        If `analysis_id` is given, results are persisted to the database.
        """
        from parsers.embedder import chunk_text
        chunks_raw = chunk_text(text)
        sample = chunks_raw[: settings.rag_top_k_analysis]
        chunks_context = "\n\n---\n\n".join(sample)

        result = self._invoke(
            major=major,
            jurusan=jurusan,
            judul_skripsi=judul_skripsi,
            chunks_context=chunks_context,
        )

        if analysis_id:
            self._save(analysis_id, result)

        return result

    # ──────────────────────────────────────────────────────────────────────
    # Private helpers
    # ──────────────────────────────────────────────────────────────────────

    def _invoke(
        self,
        major: str,
        jurusan: str,
        judul_skripsi: str,
        chunks_context: str,
    ) -> AnalysisResponse:
        """Build prompt, call LLM, parse output into AnalysisResponse."""
        prompt = self.loader.build_prompt(
            service="analisis",
            major=major,
            jurusan=jurusan,
            variables={
                "judul_skripsi":  judul_skripsi,
                "chunks_context": chunks_context,
            },
        )

        data: dict = self.chain.invoke([HumanMessage(content=prompt)])

        babs = [
            BabAnalysis(
                bab=b.get("bab", ""),
                skor=float(b.get("skor", 0)),
                analisa=b.get("analisa", ""),
                saran=b.get("saran", ""),
            )
            for b in data.get("babs", [])
        ]

        return AnalysisResponse(
            overall_score=float(data.get("overall", 0)),
            summary=data.get("summary", ""),
            babs=babs,
            potential_questions=data.get("potential_questions", []),
        )

    def _save(self, analysis_id: str, result: AnalysisResponse) -> None:
        rows = [
            {
                "analysis_id": analysis_id,
                "aspect":      b.bab,
                "score":       b.skor,
                "notes":       f"{b.analisa}\n\nSaran: {b.saran}",
            }
            for b in result.babs
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


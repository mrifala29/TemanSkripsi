"""
Similarity Agent — internal document similarity check via pgvector.

Does NOT call the LLM. Uses pure cosine similarity to find chunks
from other documents that are similar to each chunk in the target doc.

Flow:
  1. Fetch all chunks from the target document
  2. For each chunk: embed → find similar chunks from OTHER documents
  3. Deduplicate matches by chunk id
  4. Calculate overall similarity as: matched_chunks / total_source_chunks
  5. Persist result and return top matches
"""
from __future__ import annotations

import logging

from langchain_google_genai import GoogleGenerativeAIEmbeddings
from supabase import Client

from core.config import settings
from rag.retriever import find_similar_chunks, get_embedding
from schemas.requests import SimilarityRequest
from schemas.responses import SimilarChunkItem, SimilarityResponse

log = logging.getLogger(__name__)


class KesamaanAgent:
    """
    pgvector-powered similarity agent (no LLM calls).
    """

    def __init__(self, supabase: Client, embeddings: GoogleGenerativeAIEmbeddings):
        self.supabase   = supabase
        self.embeddings = embeddings

    # ──────────────────────────────────────────────────────────────────────
    # Public API
    # ──────────────────────────────────────────────────────────────────────

    def run(self, req: SimilarityRequest) -> SimilarityResponse:
        ctx = req.context

        # 1. Fetch all source chunks
        all_chunks = (
            self.supabase.table("document_chunks")
            .select("id, content, chunk_index")
            .eq("document_id", ctx.document_id)
            .order("chunk_index")
            .execute()
        ).data or []

        if not all_chunks:
            return SimilarityResponse(
                overall_similarity=0.0,
                similar_chunks=[],
                note=(
                    "Dokumen belum memiliki chunks. "
                    "Pastikan dokumen sudah berhasil diproses terlebih dahulu."
                ),
            )

        # 2. Find similar chunks from other documents for each source chunk
        all_matches: list[dict] = []
        for chunk in all_chunks:
            embedding = get_embedding(chunk["content"], self.embeddings)
            matches = find_similar_chunks(
                supabase=self.supabase,
                embedding=embedding,
                exclude_document_id=ctx.document_id,
            )
            all_matches.extend(matches)

        # 3. Deduplicate by chunk id, keep highest similarity score
        seen: dict[str, dict] = {}
        for m in all_matches:
            cid = m["id"]
            if cid not in seen or m.get("similarity", 0) > seen[cid].get("similarity", 0):
                seen[cid] = m

        top_matches = sorted(
            seen.values(),
            key=lambda x: x.get("similarity", 0),
            reverse=True,
        )[: settings.similarity_max_results]

        # 4. Overall similarity percentage
        if all_matches:
            matched = len({m["id"] for m in all_matches})
            overall = min(round(matched / len(all_chunks) * 100, 2), 100.0)
        else:
            overall = 0.0

        # 5. Build response
        similar_chunks = [
            SimilarChunkItem(
                chunk_id=m["id"],
                content_preview=m["content"][:200] + ("..." if len(m["content"]) > 200 else ""),
                similarity_score=round(m.get("similarity", 0), 4),
                source_document_id=m.get("document_id", ""),
                source_document_title=m.get("document_title", "Dokumen lain"),
            )
            for m in top_matches
        ]

        # 6. Persist
        self._save(req.similarity_check_id, overall)

        return SimilarityResponse(
            overall_similarity=overall,
            similar_chunks=similar_chunks,
            note=(
                "Pengecekan bersifat internal (antar dokumen di sistem). "
                "Hasil ini bukan pengganti Turnitin atau plagiarism checker profesional."
            ),
        )

    # ──────────────────────────────────────────────────────────────────────
    # Private helpers
    # ──────────────────────────────────────────────────────────────────────

    def _save(self, similarity_check_id: str, overall: float) -> None:
        self.supabase.table("similarity_checks").update(
            {"overall_similarity": overall, "status": "done"}
        ).eq("id", similarity_check_id).execute()
        log.info(
            "Similarity check %s saved (overall=%.2f%%)", similarity_check_id, overall
        )

"""
DEPRECATED — moved to agents/kesamaan_agent.py

KesamaanService has been replaced by KesamaanAgent which uses LangChain embeddings
and rag/retriever.py for the find_similar_chunks() call.
See agents/kesamaan_agent.py for the current implementation.
"""

import logging

import google.generativeai as genai
from supabase import Client

from rag import get_embedding
from schemas import SimilarChunkItem, SimilarityRequest, SimilarityResponse

log = logging.getLogger(__name__)

SIMILARITY_THRESHOLD = 0.70
MAX_SIMILAR_CHUNKS = 10


class KesamaanService:
    def __init__(self, supabase: Client):
        self.supabase = supabase

    def run(self, req: SimilarityRequest) -> SimilarityResponse:
        ctx = req.context

        # 1. Fetch all chunks from the target document
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

        # 2. For each chunk, find similar chunks from OTHER documents
        all_matches: list[dict] = []
        for chunk in all_chunks:
            embedding = get_embedding(chunk["content"], genai)
            matches = self._find_similar(
                embedding=embedding,
                exclude_document_id=ctx.document_id,
            )
            all_matches.extend(matches)

        # 3. Deduplicate by chunk id, keep highest similarity score
        seen: dict[str, dict] = {}
        for m in all_matches:
            cid = m["id"]
            if cid not in seen or m["similarity"] > seen[cid]["similarity"]:
                seen[cid] = m

        top_matches = sorted(
            seen.values(), key=lambda x: x["similarity"], reverse=True
        )[:MAX_SIMILAR_CHUNKS]

        # 4. Calculate overall similarity percentage
        # Ratio: how many source chunks have at least one similar match
        if top_matches:
            matched_chunks = len({m["id"] for m in all_matches})
            overall = min(round(matched_chunks / len(all_chunks) * 100, 2), 100.0)
        else:
            overall = 0.0

        # 5. Build response
        similar_chunks = [
            SimilarChunkItem(
                chunk_id=m["id"],
                content_preview=(
                    m["content"][:200] + ("..." if len(m["content"]) > 200 else "")
                ),
                similarity_score=round(m["similarity"], 4),
                source_document_id=m.get("document_id", ""),
                source_document_title=m.get("document_title", "Dokumen lain"),
            )
            for m in top_matches
        ]

        # 6. Persist result
        self._save_to_db(req.similarity_check_id, overall)

        return SimilarityResponse(
            overall_similarity=overall,
            similar_chunks=similar_chunks,
            note=(
                "Pengecekan ini bersifat internal (antar dokumen di sistem). "
                "Hasil ini bukan pengganti Turnitin atau plagiarism checker profesional."
            ),
        )

    # ──────────────────────────────────────────
    # Private helpers
    # ──────────────────────────────────────────

    def _find_similar(
        self, embedding: list[float], exclude_document_id: str
    ) -> list[dict]:
        """Query pgvector for chunks similar to the given embedding."""
        try:
            result = self.supabase.rpc(
                "match_similar_chunks",
                {
                    "query_embedding": embedding,
                    "exclude_document": exclude_document_id,
                    "match_count": 5,
                    "match_threshold": SIMILARITY_THRESHOLD,
                },
            ).execute()
            return result.data or []
        except Exception as e:
            log.warning("pgvector similarity RPC failed: %s", e)
            return []

    def _save_to_db(self, check_id: str, overall: float) -> None:
        self.supabase.table("similarity_checks").update(
            {"similarity_score": overall, "status": "done"}
        ).eq("id", check_id).execute()
        log.info("Similarity check %s saved (overall=%.2f%%)", check_id, overall)

"""
Kesamaan (Similarity) Agent — internal document similarity check via pgvector
+ LLM-based typo detection for Laporan Akhir.

Flow:
  1. Fetch all chunks from the target document
  2. For each chunk: embed → find similar chunks from OTHER documents (pgvector)
  3. Deduplicate matches, keep highest similarity per chunk
  4. Calculate overall similarity: matched_chunks / total_source_chunks × 100
  5. If document_type == "final_report":
       a. Fetch document file from Supabase Storage
       b. Extract text page by page (PyMuPDF)
       c. Run LLM typo detection in batches of _TYPO_BATCH_SIZE pages
       d. Aggregate typos with page, line, context, category
  6. Persist overall_similarity to similarity_checks and return response

Notes:
  - Typo detection requires llm to be injected (skipped gracefully if None)
  - Typo detection is PDF-only (file_type must be "pdf")
  - Pages are processed in batches to stay within LLM token limits
"""
from __future__ import annotations

import json
import logging
import re
from typing import Optional

from langchain_core.language_models import BaseChatModel
from langchain_core.messages import HumanMessage
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from supabase import Client

from core.config import settings
from parsers.extractor import extract_pages_from_pdf
from prompts.loader import PromptLoader
from rag.retriever import find_similar_chunks, get_embedding
from schemas.requests import SimilarityRequest
from schemas.responses import (
    SimilarChunkItem,
    SimilarityResponse,
    TypoCategories,
    TypoCheckResult,
    TypoItem,
)

log = logging.getLogger(__name__)

# Pages processed per LLM call — balance token usage vs. number of API calls
_TYPO_BATCH_SIZE = 8


class KesamaanAgent:
    """
    pgvector similarity agent + LLM typo detection.

    The `llm` parameter is required only for typo detection.
    If omitted, similarity check still runs but typo_check is skipped.
    """

    def __init__(
        self,
        supabase: Client,
        embeddings: GoogleGenerativeAIEmbeddings,
        llm: Optional[BaseChatModel] = None,
    ):
        self.supabase   = supabase
        self.embeddings = embeddings
        self.llm        = llm
        self._prompt    = PromptLoader()

    # ──────────────────────────────────────────────────────────────────────
    # Public API
    # ──────────────────────────────────────────────────────────────────────

    def run(self, req: SimilarityRequest) -> SimilarityResponse:
        ctx = req.context

        # ── 1. Fetch all source chunks ─────────────────────────────────────
        all_chunks = (
            self.supabase.table("document_chunks")
            .select("id, content, chunk_index")
            .eq("document_id", ctx.document_id)
            .order("chunk_index")
            .execute()
        ).data or []

        if not all_chunks:
            self._save(req.similarity_check_id, 0.0)
            return SimilarityResponse(
                overall_similarity=0.0,
                similar_chunks=[],
                typo_check=None,
                note=(
                    "Dokumen belum memiliki chunks. "
                    "Pastikan dokumen sudah berhasil diproses terlebih dahulu."
                ),
            )

        # ── 2. Find similar chunks from other documents ────────────────────
        all_matches: list[dict] = []
        for chunk in all_chunks:
            embedding = get_embedding(chunk["content"], self.embeddings)
            matches   = find_similar_chunks(
                supabase=self.supabase,
                embedding=embedding,
                exclude_document_id=ctx.document_id,
            )
            all_matches.extend(matches)

        # ── 3. Deduplicate — keep highest similarity per chunk id ──────────
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

        # ── 4. Overall similarity percentage ──────────────────────────────
        if all_matches:
            matched = len({m["id"] for m in all_matches})
            overall = min(round(matched / len(all_chunks) * 100, 2), 100.0)
        else:
            overall = 0.0

        # ── 5. Build similar_chunks list ───────────────────────────────────
        similar_chunks = [
            SimilarChunkItem(
                chunk_id=m["id"],
                content_preview=(
                    m["content"][:200] + ("..." if len(m["content"]) > 200 else "")
                ),
                similarity_score=round(m.get("similarity", 0), 4),
                source_document_id=m.get("document_id", ""),
                source_document_title=m.get("document_title", "Dokumen lain"),
            )
            for m in top_matches
        ]

        # ── 6. Typo check (Laporan Akhir only, requires LLM) ─────────────
        typo_check: Optional[TypoCheckResult] = None
        if ctx.document_type == "final_report":
            if self.llm is not None:
                try:
                    typo_check = self._check_typos(ctx.document_id)
                    log.info(
                        "Typo check done for %s — %d typos found",
                        ctx.document_id,
                        typo_check.total_typos_detected,
                    )
                except Exception as exc:
                    log.error("Typo detection failed: %s", exc, exc_info=True)
            else:
                log.warning(
                    "LLM not injected — typo detection skipped for document %s",
                    ctx.document_id,
                )

        # ── 7. Persist ─────────────────────────────────────────────────────
        self._save(req.similarity_check_id, overall)

        return SimilarityResponse(
            overall_similarity=overall,
            similar_chunks=similar_chunks,
            typo_check=typo_check,
            note=(
                "Pengecekan bersifat internal (antar dokumen di sistem). "
                "Hasil ini bukan pengganti Turnitin atau plagiarism checker profesional."
            ),
        )

    def run_from_text(
        self,
        text: str,
        major: str,
        jurusan: str,
        judul_skripsi: str,
        document_type: str,
    ) -> SimilarityResponse:
        """
        Run similarity check directly from extracted text — no embedding to database.
        Used by the /documents/similarity endpoint (Swagger + direct upload testing).

        This method:
        1. Chunks the text WITHOUT embedding to database
        2. Compares chunks against existing documents in the database
        3. Runs typo detection if document_type == "final_report"
        4. Returns results WITHOUT saving to similarity_checks table
        """
        from parsers.embedder import chunk_text

        # ── 1. Chunk the text (no embedding to DB) ─────────────────────────
        chunks = chunk_text(text)
        if not chunks:
            return SimilarityResponse(
                overall_similarity=0.0,
                similar_chunks=[],
                typo_check=None,
                note="File tidak menghasilkan konten yang dapat dianalisis.",
            )

        # ── 2. Compare chunks against existing documents ────────────────────
        all_matches: list[dict] = []
        for chunk_content in chunks:
            try:
                embedding = get_embedding(chunk_content, self.embeddings)
                matches = find_similar_chunks(
                    supabase=self.supabase,
                    embedding=embedding,
                    exclude_document_id=None,  # no document to exclude
                )
                all_matches.extend(matches)
            except Exception as exc:
                log.warning("Failed to embed chunk: %s", exc)
                continue

        # ── 3. Deduplicate — keep highest similarity per chunk id ──────────
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

        # ── 4. Overall similarity percentage ──────────────────────────────
        if all_matches:
            matched = len({m["id"] for m in all_matches})
            overall = min(round(matched / len(chunks) * 100, 2), 100.0)
        else:
            overall = 0.0

        # ── 5. Build similar_chunks list ───────────────────────────────────
        similar_chunks = [
            SimilarChunkItem(
                chunk_id=m["id"],
                content_preview=(
                    m["content"][:200] + ("..." if len(m["content"]) > 200 else "")
                ),
                similarity_score=round(m.get("similarity", 0), 4),
                source_document_id=m.get("document_id", ""),
                source_document_title=m.get("document_title", "Dokumen lain"),
            )
            for m in top_matches
        ]

        # ── 6. Typo check (Laporan Akhir only) ─────────────────────────────
        typo_check: Optional[TypoCheckResult] = None
        if document_type == "final_report":
            if self.llm is not None:
                try:
                    typo_check = self._check_typos_from_text(text)
                    log.info(
                        "Typo check completed from text — %d typos found",
                        typo_check.total_typos_detected,
                    )
                except Exception as exc:
                    log.error("Typo detection failed: %s", exc, exc_info=True)
            else:
                log.warning("LLM not injected — typo detection skipped")

        return SimilarityResponse(
            overall_similarity=overall,
            similar_chunks=similar_chunks,
            typo_check=typo_check,
            note=(
                "Pengecekan bersifat internal (antar dokumen di sistem). "
                "Hasil ini bukan pengganti Turnitin atau plagiarism checker profesional."
            ),
        )

    # ──────────────────────────────────────────────────────────────────────
    # Typo Detection
    # ──────────────────────────────────────────────────────────────────────

    def _check_typos(self, document_id: str) -> TypoCheckResult:
        """
        Download the document from Supabase Storage, extract text page by page,
        and run LLM typo detection in batches.
        """
        # Fetch document metadata
        doc_result = (
            self.supabase.table("documents")
            .select("file_path, file_type")
            .eq("id", document_id)
            .single()
            .execute()
        )
        doc_meta = doc_result.data
        if not doc_meta:
            raise ValueError(f"Document {document_id} not found in documents table")

        file_type: str = doc_meta.get("file_type", "").lower()
        if file_type != "pdf":
            log.warning(
                "Typo detection supports PDF only — skipping (file_type=%s)", file_type
            )
            return TypoCheckResult(
                total_typos_detected=0,
                typo_categories=TypoCategories(),
                typos_with_location=[],
            )

        file_path: str = doc_meta["file_path"]
        file_data: bytes = self.supabase.storage.from_("documents").download(file_path)

        pages = extract_pages_from_pdf(file_data)
        log.info(
            "Typo detection — %d pages for document %s", len(pages), document_id
        )

        # Process pages in batches
        all_typos: list[TypoItem] = []
        for batch_start in range(0, len(pages), _TYPO_BATCH_SIZE):
            batch = pages[batch_start : batch_start + _TYPO_BATCH_SIZE]
            batch_typos = self._detect_typos_batch(batch, start_page=batch_start + 1)
            all_typos.extend(batch_typos)

        # Categorise
        spelling    = sum(1 for t in all_typos if t.category == "spelling")
        grammatical = sum(1 for t in all_typos if t.category == "grammatical")
        punctuation = sum(1 for t in all_typos if t.category == "punctuation")

        return TypoCheckResult(
            total_typos_detected=len(all_typos),
            typo_categories=TypoCategories(
                spelling_errors=spelling,
                grammatical_errors=grammatical,
                punctuation_errors=punctuation,
            ),
            typos_with_location=all_typos,
        )

    def _check_typos_from_text(self, text: str) -> TypoCheckResult:
        """
        Run typo detection directly from extracted text (no database lookup).
        Used by run_from_text() for testing/direct upload scenarios.
        """
        from parsers.extractor import extract_pages_from_text

        pages = extract_pages_from_text(text)
        log.info("Typo detection — %d pages from extracted text", len(pages))

        # Process pages in batches
        all_typos: list[TypoItem] = []
        for batch_start in range(0, len(pages), _TYPO_BATCH_SIZE):
            batch = pages[batch_start : batch_start + _TYPO_BATCH_SIZE]
            batch_typos = self._detect_typos_batch(batch, start_page=batch_start + 1)
            all_typos.extend(batch_typos)

        # Categorise
        spelling    = sum(1 for t in all_typos if t.category == "spelling")
        grammatical = sum(1 for t in all_typos if t.category == "grammatical")
        punctuation = sum(1 for t in all_typos if t.category == "punctuation")

        return TypoCheckResult(
            total_typos_detected=len(all_typos),
            typo_categories=TypoCategories(
                spelling_errors=spelling,
                grammatical_errors=grammatical,
                punctuation_errors=punctuation,
            ),
            typos_with_location=all_typos,
        )

    def _detect_typos_batch(
        self, pages: list[str], start_page: int
    ) -> list[TypoItem]:
        """
        Run LLM typo detection on a single batch of pages.

        Pages are annotated with [Halaman N] markers so the LLM can include
        the correct page number in its JSON output.
        """
        # Build annotated text with page markers
        annotated_parts: list[str] = []
        for i, page_text in enumerate(pages):
            page_num  = start_page + i
            page_body = page_text.strip()
            if page_body:
                annotated_parts.append(f"[Halaman {page_num}]\n{page_body}")

        if not annotated_parts:
            return []

        annotated = "\n\n".join(annotated_parts)
        prompt_text = self._prompt.build_typo_prompt(annotated)

        response  = self.llm.invoke([HumanMessage(content=prompt_text)])
        raw_text  = response.content if hasattr(response, "content") else str(response)

        return self._parse_typo_response(raw_text, start_page)

    def _parse_typo_response(self, raw: str, start_page: int) -> list[TypoItem]:
        """
        Parse LLM output into a list of TypoItem.

        The LLM is instructed to return a bare JSON array.  This method
        extracts the first `[…]` block it finds, parses it, and maps each
        dict to a TypoItem, skipping malformed entries.
        """
        match = re.search(r"\[.*?\]", raw, re.DOTALL)
        if not match:
            log.debug("No JSON array found in typo response: %s", raw[:200])
            return []

        try:
            items = json.loads(match.group())
        except json.JSONDecodeError as exc:
            log.warning("Typo JSON parse error: %s | snippet: %s", exc, raw[:200])
            return []

        result: list[TypoItem] = []
        for item in items:
            if not isinstance(item, dict):
                continue
            try:
                category = item.get("category", "spelling").lower()
                if category not in ("spelling", "grammatical", "punctuation"):
                    category = "spelling"

                result.append(
                    TypoItem(
                        typo=str(item.get("typo", "")).strip(),
                        correction=str(item.get("correction", "")).strip(),
                        page=int(item.get("page", start_page)),
                        line=int(item.get("line", 1)),
                        context=str(item.get("context", "")).strip()[:200],
                        category=category,
                    )
                )
            except (ValueError, TypeError) as exc:
                log.debug("Skipping malformed typo item: %s — %s", item, exc)

        return result

    # ──────────────────────────────────────────────────────────────────────
    # Persist
    # ──────────────────────────────────────────────────────────────────────

    def _save(self, similarity_check_id: str, overall: float) -> None:
        self.supabase.table("similarity_checks").update(
            {"overall_similarity": overall, "status": "done"}
        ).eq("id", similarity_check_id).execute()
        log.info(
            "Similarity check %s saved (overall=%.2f%%)",
            similarity_check_id,
            overall,
        )

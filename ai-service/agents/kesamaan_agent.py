"""
Kesamaan (Similarity) Agent — Pivot to AI Writing Detection + Typo Check.

Flow:
  1. If run() is called, download the document from Supabase Storage.
  2. Extract document pages and full text.
  3. Split text into chapters based on "BAB I", "BAB II", etc.
  4. Run LLM on each chapter to estimate AI writing percentage.
  5. Calculate overall AI writing percentage as a weighted or simple average of chapters.
  6. Run LLM typo detection on pages in batches.
  7. Persist results (overall AI percentage and summary) to the similarity_checks table.
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
from schemas.requests import SimilarityRequest
from schemas.responses import (
    ChapterAIDetection,
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
    AI Writing Detection + Typo Check Agent.
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

        # Fetch document metadata
        doc_result = (
            self.supabase.table("documents")
            .select("file_path, file_type")
            .eq("id", ctx.document_id)
            .single()
            .execute()
        )
        doc_meta = doc_result.data
        if not doc_meta:
            raise ValueError(f"Document {ctx.document_id} not found in documents table")

        file_type: str = doc_meta.get("file_type", "").lower()
        file_path: str = doc_meta["file_path"]
        
        # Download document
        file_data: bytes = self.supabase.storage.from_("documents").download(file_path)

        if file_type == "pdf":
            pages = extract_pages_from_pdf(file_data)
            text = "\n".join(pages)
        else:
            text = file_data.decode("utf-8", errors="ignore")
            pages = [text]

        # 1. AI Detection
        overall_ai_pct, per_chapter, summary = self._detect_ai_writing(text, ctx.judul_skripsi)

        # 2. Typo Check (run for both proposal and final_report if LLM is active)
        typo_check = None
        if self.llm is not None:
            try:
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

                typo_check = TypoCheckResult(
                    total_typos_detected=len(all_typos),
                    typo_categories=TypoCategories(
                        spelling_errors=spelling,
                        grammatical_errors=grammatical,
                        punctuation_errors=punctuation,
                    ),
                    typos_with_location=all_typos,
                )
                log.info(
                    "Typo check done for %s — %d typos found",
                    ctx.document_id,
                    typo_check.total_typos_detected,
                )
            except Exception as exc:
                log.error("Typo detection failed: %s", exc, exc_info=True)
        else:
            log.warning("LLM not injected — typo detection skipped")

        # 3. Persist
        self._save(req.similarity_check_id, overall_ai_pct, summary)

        return SimilarityResponse(
            overall_ai_percentage=overall_ai_pct,
            per_chapter=per_chapter,
            summary=summary,
            typo_check=typo_check,
            note=(
                "Pengecekan tulisan AI menggunakan estimasi model bahasa (LLM) berdasarkan pola tulisan. "
                "Hasil ini bukan bukti mutlak plagiarisme atau penggunaan AI. Gunakan sebagai referensi awal."
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
        Run AI writing detection + typo check directly from text — no database lookup.
        Used by Swagger/testing.
        """
        # 1. AI Detection
        overall_ai_pct, per_chapter, summary = self._detect_ai_writing(text, judul_skripsi)

        # 2. Typo Check (from text)
        typo_check = None
        if self.llm is not None:
            try:
                typo_check = self._check_typos_from_text(text)
                log.info(
                    "Typo check completed from text — %d typos found",
                    typo_check.total_typos_detected,
                )
            except Exception as exc:
                log.error("Typo detection failed from text: %s", exc, exc_info=True)

        return SimilarityResponse(
            overall_ai_percentage=overall_ai_pct,
            per_chapter=per_chapter,
            summary=summary,
            typo_check=typo_check,
            note=(
                "Pengecekan tulisan AI menggunakan estimasi model bahasa (LLM) berdasarkan pola tulisan. "
                "Hasil ini bukan bukti mutlak plagiarisme atau penggunaan AI. Gunakan sebagai referensi awal."
            ),
        )

    # ──────────────────────────────────────────────────────────────────────
    # AI Writing Detection helpers
    # ──────────────────────────────────────────────────────────────────────

    def _split_chapters(self, text: str) -> list[tuple[str, str]]:
        """
        Split thesis text into chapters based on markers like 'BAB I', 'BAB II', etc.
        Returns a list of tuples: (chapter_name, chapter_text).
        If no BAB markers are found, returns the entire text as one chapter "DOKUMEN UTAMA".
        """
        pattern = r"(?m)^\s*(BAB\s+(?:[IVXLCDM]+|[0-9]+)\b.*)"
        matches = list(re.finditer(pattern, text, re.IGNORECASE))
        
        if not matches:
            return [("DOKUMEN UTAMA", text.strip())]
            
        chapters = []
        for i, match in enumerate(matches):
            start = match.start()
            end = matches[i+1].start() if i + 1 < len(matches) else len(text)
            
            chapter_block = text[start:end].strip()
            # Split into header line and body
            lines = chapter_block.split("\n", 1)
            header = lines[0].strip()
            body = lines[1].strip() if len(lines) > 1 else ""
            
            # Clean header if it's too long
            if len(header) > 100:
                header = header[:97] + "..."
            
            chapters.append((header, body))
            
        return chapters

    def _detect_ai_writing(self, text: str, judul_skripsi: str) -> tuple[float, list[ChapterAIDetection], str]:
        """
        Detect AI writing percentage per chapter.
        """
        if self.llm is None:
            return 0.0, [], "LLM tidak aktif. Gagal melakukan deteksi tulisan AI."

        chapters = self._split_chapters(text)
        
        per_chapter_results = []
        overall_percentage_sum = 0.0
        valid_chapters_count = 0
        
        for name, body in chapters:
            # Skip empty or very short chapters
            if not body or len(body.strip().split()) < 50:
                if len(chapters) > 1:
                    continue
            
            # Truncate extremely long chapters to avoid context limit
            max_chars = 40000
            truncated_body = body if len(body) <= max_chars else body[:max_chars] + "\n...[Teks dipotong karena terlalu panjang]..."
            
            prompt_text = self._prompt.build_ai_detection_prompt(
                chapter_text=truncated_body,
                chapter_name=name,
                judul_skripsi=judul_skripsi
            )
            
            try:
                response = self.llm.invoke([HumanMessage(content=prompt_text)])
                raw_text = response.content if hasattr(response, "content") else str(response)
                
                parsed_json = self._parse_ai_detection_response(raw_text, name)
                
                per_chapter_results.append(parsed_json)
                overall_percentage_sum += parsed_json.ai_percentage
                valid_chapters_count += 1
            except Exception as exc:
                log.error("Failed to detect AI for chapter %s: %s", name, exc, exc_info=True)
                per_chapter_results.append(
                    ChapterAIDetection(
                        bab=name,
                        total_sentences=0,
                        ai_sentences_count=0,
                        ai_percentage=0.0,
                        confidence="low",
                        indicators=["Gagal menganalisis bab ini karena error sistem"],
                        ai_sentences=[]
                    )
                )
        
        if valid_chapters_count > 0:
            overall_ai_percentage = round(overall_percentage_sum / valid_chapters_count, 2)
        else:
            overall_ai_percentage = 0.0
            
        # Build narrative summary
        if overall_ai_percentage > 70:
            summary = f"Mayoritas bab dalam skripsi ini memiliki indikasi sangat kuat ditulis menggunakan AI (rata-rata {overall_ai_percentage}%). Disarankan melakukan pemeriksaan manual secara menyeluruh."
        elif overall_ai_percentage > 30:
            summary = f"Beberapa bab menunjukkan indikasi sedang ditulis menggunakan AI (rata-rata {overall_ai_percentage}%). Harap periksa kembali bagian-bagian yang ditandai."
        else:
            summary = f"Skripsi ini secara umum menunjukkan indikasi rendah ditulis menggunakan AI (rata-rata {overall_ai_percentage}%). Struktur penulisan tampak alami."
            
        return overall_ai_percentage, per_chapter_results, summary

    def _parse_ai_detection_response(self, raw: str, default_bab_name: str) -> ChapterAIDetection:
        """
        Parse LLM output for AI detection. Expects a JSON object with sentence-level detection.
        """
        match = re.search(r"\{.*?\}", raw, re.DOTALL)
        if not match:
            log.warning("No JSON object found in AI detection response: %s", raw[:200])
            return ChapterAIDetection(
                bab=default_bab_name,
                total_sentences=0,
                ai_sentences_count=0,
                ai_percentage=0.0,
                confidence="low",
                indicators=["Gagal memproses respons AI"],
                ai_sentences=[]
            )
            
        try:
            data = json.loads(match.group())
        except json.JSONDecodeError as exc:
            log.warning("AI detection JSON parse error: %s | snippet: %s", exc, raw[:200])
            return ChapterAIDetection(
                bab=default_bab_name,
                total_sentences=0,
                ai_sentences_count=0,
                ai_percentage=0.0,
                confidence="low",
                indicators=["Gagal memproses respons AI (JSON rusak)"],
                ai_sentences=[]
            )
            
        bab_name = data.get("bab", default_bab_name)
        
        # Parse new fields
        try:
            total_sentences = int(data.get("total_sentences", 0))
        except (TypeError, ValueError):
            total_sentences = 0
            
        try:
            ai_sentences_count = int(data.get("ai_sentences_count", 0))
        except (TypeError, ValueError):
            ai_sentences_count = 0
        
        try:
            ai_percentage = float(data.get("ai_percentage", 0.0))
        except (TypeError, ValueError):
            ai_percentage = 0.0
            
        confidence = str(data.get("confidence", "low")).lower()
        if confidence not in ("high", "medium", "low"):
            confidence = "low"
            
        indicators = data.get("indicators", [])
        if not isinstance(indicators, list):
            indicators = [str(indicators)] if indicators else []
            
        ai_sentences = data.get("ai_sentences", [])
        if not isinstance(ai_sentences, list):
            ai_sentences = [str(ai_sentences)] if ai_sentences else []
            
        return ChapterAIDetection(
            bab=bab_name,
            total_sentences=total_sentences,
            ai_sentences_count=ai_sentences_count,
            ai_percentage=ai_percentage,
            confidence=confidence,
            indicators=[str(i) for i in indicators[:3]],
            ai_sentences=[str(s) for s in ai_sentences[:10]]
        )

    # ──────────────────────────────────────────────────────────────────────
    # Typo Detection helpers
    # ──────────────────────────────────────────────────────────────────────

    def _check_typos_from_text(self, text: str) -> TypoCheckResult:
        """
        Run typo detection directly from extracted text.
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
        """
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

    def _save(self, similarity_check_id: str, overall: float, summary: str) -> None:
        self.supabase.table("similarity_checks").update(
            {
                "overall_similarity": overall, 
                "similarity_note": summary, 
                "status": "done"
            }
        ).eq("id", similarity_check_id).execute()
        log.info(
            "Similarity check %s saved (overall=%.2f%%)",
            similarity_check_id,
            overall,
        )

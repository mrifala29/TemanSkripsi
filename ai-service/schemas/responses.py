"""
Response models for all AI service endpoints.
"""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel


# ─────────────────────────────────────────────
# Analysis
# ─────────────────────────────────────────────

class AspectAnalysis(BaseModel):
    aspek: str    # DB enum key: "latar_belakang", "rumusan_masalah", etc.
    label: str    # Human-readable: "Latar Belakang", "Rumusan Masalah", etc.
    skor: float   # 0–100
    analisa: str  # detailed analysis for this aspect
    saran: str    # specific improvement suggestions for this aspect


class AnalysisResponse(BaseModel):
    document_type: str                          # "proposal" | "final_report"
    overall_score: float
    summary: str
    aspects: list[AspectAnalysis]
    potential_questions: list[str] = []         # Laporan Akhir only (3–5 questions)


# ─────────────────────────────────────────────
# Simulation
# ─────────────────────────────────────────────

class SimulationStartResponse(BaseModel):
    session_id: str
    question: str
    turn: int


class SimulationMessageResponse(BaseModel):
    session_id: str
    ai_message: str
    is_followup: bool   # True = drilling deeper on the same topic
    turn: int


# ─────────────────────────────────────────────
# Similarity + Typo Check
# ─────────────────────────────────────────────

class SimilarChunkItem(BaseModel):
    chunk_id: str
    content_preview: str
    similarity_score: float         # 0.0–1.0
    source_document_id: str
    source_document_title: str


class TypoItem(BaseModel):
    typo: str                       # The erroneous word/phrase as found in the text
    correction: str                 # Suggested correction
    page: int                       # Page number in the document (1-indexed)
    line: int                       # Estimated line within the page (1-indexed)
    context: str                    # Surrounding sentence fragment for location
    category: str                   # "spelling" | "grammatical" | "punctuation"


class TypoCategories(BaseModel):
    spelling_errors: int = 0
    grammatical_errors: int = 0
    punctuation_errors: int = 0


class TypoCheckResult(BaseModel):
    total_typos_detected: int
    typo_categories: TypoCategories
    typos_with_location: list[TypoItem]


class SimilarityResponse(BaseModel):
    overall_similarity: float               # 0–100 percentage
    similar_chunks: list[SimilarChunkItem]
    typo_check: Optional[TypoCheckResult] = None   # None for proposals
    note: str

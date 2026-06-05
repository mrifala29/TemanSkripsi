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
# AI Writing Detection + Typo Check
# ─────────────────────────────────────────────

class ChapterAIDetection(BaseModel):
    bab: str                       # Name of the chapter (e.g., "BAB I", "BAB II", etc.)
    total_sentences: int           # Total number of sentences in the chapter
    ai_sentences_count: int        # Number of sentences detected as AI-written
    ai_percentage: float           # Calculated as (ai_sentences_count / total_sentences) × 100
    confidence: str                # "high" | "medium" | "low"
    indicators: list[str]          # Ciri-ciri tulisan AI found
    ai_sentences: list[str]        # Full sentences that are detected as AI-written (max 10 strongest examples)


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
    overall_ai_percentage: float            # 0–100 percentage
    per_chapter: list[ChapterAIDetection]
    summary: str
    typo_check: Optional[TypoCheckResult] = None   # Can be None, but will be run for both proposal and final_report per settings
    note: str


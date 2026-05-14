"""
Response models for all AI service endpoints.
"""
from __future__ import annotations

from pydantic import BaseModel


# ─────────────────────────────────────────────
# Analysis
# ─────────────────────────────────────────────

class BabAnalysis(BaseModel):
    bab: str      # e.g. "BAB I – Pendahuluan"
    skor: float   # 0–100
    analisa: str  # detailed analysis of the chapter
    saran: str    # specific improvement suggestions for the chapter


class AnalysisResponse(BaseModel):
    overall_score: float
    summary: str
    babs: list[BabAnalysis]
    potential_questions: list[str]


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
# Similarity
# ─────────────────────────────────────────────

class SimilarChunkItem(BaseModel):
    chunk_id: str
    content_preview: str
    similarity_score: float         # 0.0–1.0
    source_document_id: str
    source_document_title: str


class SimilarityResponse(BaseModel):
    overall_similarity: float       # 0–100 percentage
    similar_chunks: list[SimilarChunkItem]
    note: str

"""
Response models for all AI service endpoints.
"""
from __future__ import annotations

from pydantic import BaseModel


# ─────────────────────────────────────────────
# Analysis
# ─────────────────────────────────────────────

class AnalysisScoreItem(BaseModel):
    aspect: str          # DB key, e.g. "latar_belakang"
    aspect_display: str  # human-readable, e.g. "Kejelasan Latar Belakang"
    score: float         # 0–100
    feedback: str


class AnalysisResponse(BaseModel):
    overall_score: float
    summary: str
    scores: list[AnalysisScoreItem]
    weaknesses: list[str]
    suggestions: list[str]
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

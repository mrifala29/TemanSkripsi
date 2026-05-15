"""
Response models for all AI service endpoints.
"""
from __future__ import annotations

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
    overall_score: float
    summary: str
    aspects: list[AspectAnalysis]


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

"""
DEPRECATED — this file is shadowed by the schemas/ package.

All models have moved to:
  schemas/common.py    — DocumentContext
  schemas/requests.py  — ParseRequest, AnalysisRequest, Simulation*Request, SimilarityRequest
  schemas/responses.py — AnalysisResponse, Simulation*Response, SimilarityResponse, etc.
  schemas/__init__.py  — re-exports everything for convenience

This file exists only as a fallback shim and is not imported by any module.
"""

from typing import Optional
from pydantic import BaseModel


# ─────────────────────────────────────────────
# Shared Input Context
# ─────────────────────────────────────────────

class DocumentContext(BaseModel):
    """Shared document context used by all AI endpoints."""
    document_id: str
    major: str          # folder name, e.g. "pendidikan", "hukum", "bisnis"
    jurusan: str        # file name slug, e.g. "pendidikan-matematika", "hukum-pidana"
    judul_skripsi: str  # e.g. "Implementasi Metode Jigsaw di SMP Negeri 5 Bandung"
    bab_fokus: Optional[str] = None  # Optional: narrow context to a specific chapter


# ─────────────────────────────────────────────
# Parse / Embed
# ─────────────────────────────────────────────

class ParseRequest(BaseModel):
    document_id: str
    file_path: str    # Path in Supabase Storage bucket
    file_type: str    # "pdf" | "pptx"


# ─────────────────────────────────────────────
# Analysis
# ─────────────────────────────────────────────

class AnalysisRequest(BaseModel):
    context: DocumentContext
    analysis_id: str


class AnalysisScoreItem(BaseModel):
    aspect: str          # DB key, e.g. "latar_belakang"
    aspect_display: str  # Human-readable, e.g. "Kejelasan Latar Belakang"
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

class SimulationStartRequest(BaseModel):
    context: DocumentContext
    session_id: str


class SimulationStartResponse(BaseModel):
    session_id: str
    question: str
    turn: int


class SimulationMessageRequest(BaseModel):
    context: DocumentContext
    session_id: str
    user_message: str
    chat_history: list[dict]  # [{"role": "assistant"|"user", "content": "..."}]


class SimulationMessageResponse(BaseModel):
    session_id: str
    ai_message: str
    is_followup: bool   # True = AI is digging deeper on same topic
    turn: int


# ─────────────────────────────────────────────
# Similarity
# ─────────────────────────────────────────────

class SimilarityRequest(BaseModel):
    context: DocumentContext
    similarity_check_id: str


class SimilarChunkItem(BaseModel):
    chunk_id: str
    content_preview: str
    similarity_score: float         # 0–1
    source_document_id: str
    source_document_title: str


class SimilarityResponse(BaseModel):
    overall_similarity: float       # 0–100 percentage
    similar_chunks: list[SimilarChunkItem]
    note: str

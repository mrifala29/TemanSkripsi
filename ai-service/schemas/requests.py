"""
Request models for all AI service endpoints.
"""
from __future__ import annotations

from pydantic import BaseModel

from schemas.common import DocumentContext


class ParseRequest(BaseModel):
    document_id: str
    file_path: str    # path inside Supabase Storage "documents" bucket
    file_type: str    # "pdf"


class AnalysisRequest(BaseModel):
    context: DocumentContext
    analysis_id: str   # pre-created analyses record UUID


class SimulationStartRequest(BaseModel):
    context: DocumentContext
    session_id: str    # pre-created simulation_sessions record UUID


class SimulationMessageRequest(BaseModel):
    context: DocumentContext
    session_id: str
    user_message: str
    chat_history: list[dict]  # [{"role": "assistant"|"user", "content": "..."}]


class SimilarityRequest(BaseModel):
    context: DocumentContext
    similarity_check_id: str  # pre-created similarity_checks record UUID

"""
Schemas package — all Pydantic request/response models.
"""
from schemas.common import DocumentContext
from schemas.requests import (
    AnalysisRequest,
    ParseRequest,
    SimulationMessageRequest,
    SimulationStartRequest,
    SimilarityRequest,
)
from schemas.responses import (
    AnalysisResponse,
    AspectAnalysis,
    ChapterAIDetection,
    SimulationMessageResponse,
    SimulationStartResponse,
    SimilarityResponse,
    TypoItem,
    TypoCategories,
    TypoCheckResult,
)

__all__ = [
    # common
    "DocumentContext",
    # requests
    "ParseRequest",
    "AnalysisRequest",
    "SimulationStartRequest",
    "SimulationMessageRequest",
    "SimilarityRequest",
    # responses
    "AnalysisResponse",
    "AspectAnalysis",
    "SimulationStartResponse",
    "SimulationMessageResponse",
    "ChapterAIDetection",
    "SimilarityResponse",
    "TypoItem",
    "TypoCategories",
    "TypoCheckResult",
]

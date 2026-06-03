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
    SimilarChunkItem,
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
    "SimilarChunkItem",
    "SimilarityResponse",
    "TypoItem",
    "TypoCategories",
    "TypoCheckResult",
]

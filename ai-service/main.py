"""
TemanSkripsi AI Service — application entry point.

This file contains ONLY:
  - FastAPI app bootstrap & middleware
  - Route definitions (thin — delegate all logic to agents/)
  - Background task registration for document parsing

Business logic lives in:
  agents/      — LangChain-powered AI agents (analisis, simulasi, kesamaan)
  parsers/     — document text extraction (extractor) and embedding (embedder)
  rag/         — pgvector retrieval utilities
  prompts/     — 3-layer prompt loader and .md template files
  schemas/     — Pydantic request/response models
  core/        — config, dependency injection, memory utilities
"""
import logging
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import BackgroundTasks, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from agents.analisis_agent import AnalisisAgent
from agents.kesamaan_agent import KesamaanAgent
from agents.simulasi_agent import SimulasiAgent
from core.dependencies import get_embeddings, get_llm, get_supabase
from parsers.embedder import chunk_text, embed_and_store
from parsers.extractor import extract_text
from schemas import (
    AnalysisRequest,
    AnalysisResponse,
    ParseRequest,
    SimilarityRequest,
    SimilarityResponse,
    SimulationMessageRequest,
    SimulationMessageResponse,
    SimulationStartRequest,
    SimulationStartResponse,
)

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

# ──────────────────────────────────────────────────────────────────────────
# App
# ──────────────────────────────────────────────────────────────────────────


@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("TemanSkripsi AI Service v2 started")
    yield
    log.info("TemanSkripsi AI Service shutting down")


app = FastAPI(
    title="TemanSkripsi AI Service",
    description=(
        "AI endpoints untuk analisis skripsi, simulasi sidang, dan cek kesamaan. "
        "Semua fitur AI berbasis RAG (Retrieval-Augmented Generation) menggunakan LangChain + Gemini."
    ),
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ──────────────────────────────────────────────────────────────────────────
# Background task: document parsing
# ──────────────────────────────────────────────────────────────────────────


def _parse_and_embed(document_id: str, file_path: str, file_type: str) -> None:
    """Download → extract text → chunk → embed → store in document_chunks."""
    supabase   = get_supabase()
    embeddings = get_embeddings()
    try:
        data   = supabase.storage.from_("documents").download(file_path)
        text   = extract_text(data, file_type)
        chunks = chunk_text(text)
        embed_and_store(supabase, embeddings, document_id, chunks)
        supabase.table("documents").update({"parse_status": "done"}).eq("id", document_id).execute()
        log.info("Document %s parsed (%d chunks)", document_id, len(chunks))
    except Exception as exc:
        log.error("Parse failed for %s: %s", document_id, exc, exc_info=True)
        supabase.table("documents").update({"parse_status": "failed"}).eq("id", document_id).execute()


# ──────────────────────────────────────────────────────────────────────────
# Routes: Meta
# ──────────────────────────────────────────────────────────────────────────


@app.get("/health", tags=["Meta"])
def health():
    """Health check."""
    return {"status": "ok", "service": "temanskripsi-ai", "version": "2.0.0"}


# ──────────────────────────────────────────────────────────────────────────
# Routes: Documents
# ──────────────────────────────────────────────────────────────────────────


@app.post("/documents/parse", status_code=202, tags=["Documents"])
def parse_document(req: ParseRequest, bg: BackgroundTasks):
    """
    Trigger async document parsing and embedding.

    - **document_id**: UUID of the document record
    - **file_path**: Path inside Supabase Storage `documents` bucket
    - **file_type**: `"pdf"` or `"pptx"`
    """
    bg.add_task(_parse_and_embed, req.document_id, req.file_path, req.file_type)
    return {"message": "Parsing dimulai", "document_id": req.document_id}


# ──────────────────────────────────────────────────────────────────────────
# Routes: Analysis
# ──────────────────────────────────────────────────────────────────────────


@app.post("/documents/analyze", response_model=AnalysisResponse, tags=["Analysis"])
def analyze_document(req: AnalysisRequest):
    """
    Analyze and score a thesis across 6 academic aspects using RAG + LangChain.

    - **context.document_id**: Thesis document UUID
    - **context.major**: Faculty slug, e.g. `"pendidikan"`, `"hukum"`, `"bisnis"`
    - **context.jurusan**: Program slug, e.g. `"pendidikan-matematika"`, `"hukum-pidana"`
    - **context.judul_skripsi**: Full thesis title (used as RAG query)
    - **analysis_id**: Pre-created `analyses` record UUID

    Returns structured scores (0–100) per aspect with feedback, weaknesses, suggestions,
    and potential examiner questions.
    """
    try:
        agent = AnalisisAgent(get_supabase(), get_llm(), get_embeddings())
        return agent.run(req)
    except Exception as exc:
        log.error("Analysis failed: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))


# ──────────────────────────────────────────────────────────────────────────
# Routes: Simulation
# ──────────────────────────────────────────────────────────────────────────


@app.post("/sessions/start", response_model=SimulationStartResponse, tags=["Simulation"])
def session_start(req: SimulationStartRequest):
    """
    Start a thesis defence simulation — returns the first examiner question.

    - **context.document_id**: Thesis document UUID
    - **context.major / context.jurusan**: Used to load the per-jurusan prompt
    - **context.judul_skripsi**: Thesis title (used as RAG query)
    - **session_id**: Pre-created `simulation_sessions` record UUID
    """
    try:
        agent = SimulasiAgent(get_supabase(), get_llm(), get_embeddings())
        return agent.start(req)
    except Exception as exc:
        log.error("Session start failed: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/sessions/message", response_model=SimulationMessageResponse, tags=["Simulation"])
def session_message(req: SimulationMessageRequest):
    """
    Send a student answer and receive the next examiner question or follow-up.

    - **user_message**: The student's latest answer
    - **chat_history**: Full conversation — `[{"role": "assistant"|"user", "content": "..."}]`
    - **session_id**: Active session UUID
    """
    try:
        agent = SimulasiAgent(get_supabase(), get_llm(), get_embeddings())
        return agent.message(req)
    except Exception as exc:
        log.error("Session message failed: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))


# ──────────────────────────────────────────────────────────────────────────
# Routes: Similarity
# ──────────────────────────────────────────────────────────────────────────


@app.post("/documents/similarity", response_model=SimilarityResponse, tags=["Similarity"])
def check_similarity(req: SimilarityRequest):
    """
    Check internal document similarity via pgvector cosine similarity.

    **Internal check only** — not a replacement for Turnitin.

    - **context.document_id**: Target document UUID
    - **similarity_check_id**: Pre-created `similarity_checks` record UUID

    Returns overall similarity percentage and top matching chunks.
    """
    try:
        agent = KesamaanAgent(get_supabase(), get_embeddings())
        return agent.run(req)
    except Exception as exc:
        log.error("Similarity check failed: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))





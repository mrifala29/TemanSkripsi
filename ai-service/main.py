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
from typing import Optional
from uuid import uuid4

from dotenv import load_dotenv
from fastapi import BackgroundTasks, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from agents.analisis_agent import AnalisisAgent
from agents.kesamaan_agent import KesamaanAgent
from agents.simulasi_agent import SimulasiAgent
from core.dependencies import get_embeddings, get_llm, get_supabase
from parsers.embedder import chunk_text, embed_and_store
from parsers.extractor import extract_text
from schemas import (
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

from core.config import settings

# ──────────────────────────────────────────────────────────────────────────
# App
# ──────────────────────────────────────────────────────────────────────────


@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info(
        "TemanSkripsi AI Service v2.0 started (port %d, model=%s)",
        settings.fastapi_port,
        settings.llm_model,
    )
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


@app.post("/documents/parse", status_code=202, tags=["Documents"], include_in_schema=False)
def parse_document(req: ParseRequest, bg: BackgroundTasks):
    """Trigger async document parsing and embedding (internal — called by backend)."""
    bg.add_task(_parse_and_embed, req.document_id, req.file_path, req.file_type)
    return {"message": "Parsing dimulai", "document_id": req.document_id}


# ──────────────────────────────────────────────────────────────────────────
# Routes: Analysis
# ──────────────────────────────────────────────────────────────────────────


@app.post("/documents/analyze", response_model=AnalysisResponse, tags=["Analysis"])
async def analyze_document(
    file: UploadFile = File(..., description="File PDF atau PPTX skripsi"),
    faculty: str = Form(..., description="Faculty slug: pendidikan | hukum | bisnis | teknologi | humaniora | kesehatan"),
    program: str = Form(..., description="Program slug, e.g. pendidikan-matematika, hukum-pidana, teknik-informatika"),
    judul_skripsi: str = Form(..., description="Judul lengkap skripsi"),
    analysis_id: Optional[str] = Form(None, description="(Opsional) UUID analyses record — jika kosong dan save=true, UUID otomatis di-generate"),
    document_id: Optional[str] = Form(None, description="(Opsional) UUID dokumen — diperlukan jika save=true tanpa analysis_id"),
    user_id: Optional[str] = Form(None, description="(Opsional) UUID user — diperlukan jika save=true tanpa analysis_id"),
    save: bool = Form(True, description="Jika False, hasil tidak disimpan ke database (mode RnD/testing)"),
):
    """
    Analisis skripsi per **aspek** menggunakan LangChain + Gemini.

    Upload langsung file PDF/PPTX — tidak perlu parse terpisah.
    Gunakan `save=false` untuk mode RnD/testing tanpa menyimpan ke database.

    **5 Aspek**: Latar Belakang | Rumusan Masalah | Metodologi | Analisis & Pembahasan | Kesimpulan & Saran

    **Output per aspek**: `aspek` (kode DB), `label`, `skor` (0–100), `analisa`, `saran`
    """
    file_type = (file.filename or "").rsplit(".", 1)[-1].lower()
    if file_type not in ("pdf", "pptx"):
        raise HTTPException(status_code=400, detail="File harus berformat PDF atau PPTX")

    try:
        # Resolve analysis_id jika save=True
        if save and not (analysis_id and analysis_id.strip()):
            if document_id and user_id:
                # Create analyses record dengan relasi lengkap
                analysis_id = str(uuid4())
                get_supabase().table("analyses").insert(
                    {
                        "id":          analysis_id,
                        "document_id": document_id,
                        "user_id":     user_id,
                        "status":      "processing",
                    }
                ).execute()
                log.info("Created analyses record: %s (doc=%s)", analysis_id, document_id)
            else:
                # Tidak ada relasi lengkap — switch ke mode no-save, beri warning
                log.warning(
                    "save=true tapi document_id/user_id tidak diberikan — hasil tidak disimpan ke DB. "
                    "Gunakan save=false untuk testing atau berikan document_id+user_id."
                )
                save = False

        raw = await file.read()
        text = extract_text(raw, file_type)
        agent = AnalisisAgent(get_supabase(), get_llm(), get_embeddings())
        return agent.run_from_text(
            text=text,
            major=faculty,
            jurusan=program,
            judul_skripsi=judul_skripsi,
            analysis_id=analysis_id if save else None,
        )
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





if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=settings.fastapi_host,
        port=settings.fastapi_port,
        reload=True,
    )

"""
Application settings — loaded from the root .env file.

All model names, thresholds, and tuning constants live here.
Never scatter magic numbers across the codebase — reference settings instead.
"""
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# Resolve root .env regardless of working directory
_ROOT_ENV = Path(__file__).resolve().parent.parent.parent / ".env"


class Settings(BaseSettings):
    # ── Supabase ───────────────────────────────────────────────────────────
    supabase_url: str
    supabase_service_role_key: str

    # ── LLM Configuration ──────────────────────────────────────────────────
    llm_api_key: str  # from env LLM_API_KEY
    llm_model: str = "gemini-1.5-flash"  # from env LLM_MODEL
    llm_temperature: float = 0.7  # from env LLM_TEMPERATURE
    llm_max_token: int = 2000  # from env LLM_MAX_TOKEN (informational)

    # ── Embedding (fixed for now) ──────────────────────────────────────────
    embedding_model: str = "models/text-embedding-004"

    # ── Document parsing ───────────────────────────────────────────────────
    chunk_size: int = 800       # characters per chunk
    chunk_overlap: int = 100    # characters of overlap between adjacent chunks
    embed_batch_size: int = 20  # rows per Supabase insert call

    # ── RAG retrieval ──────────────────────────────────────────────────────
    rag_threshold: float = 0.65
    rag_top_k_analysis: int = 12
    rag_top_k_simulation_start: int = 8
    rag_top_k_simulation_message: int = 5

    # ── Similarity check ───────────────────────────────────────────────────
    similarity_threshold: float = 0.70
    similarity_max_results: int = 10

    # ── Conversation memory ────────────────────────────────────────────────
    chat_history_window: int = 6  # last N turns kept for simulation context

    # ── FastAPI Server ─────────────────────────────────────────────────────
    fastapi_host: str = "0.0.0.0"  # from env FASTAPI_HOST
    fastapi_port: int = 8001  # from env FASTAPI_PORT

    model_config = SettingsConfigDict(
        env_file=[str(_ROOT_ENV), ".env"],  # root env first, local .env as fallback
        env_file_encoding="utf-8",
        extra="ignore",  # silently ignore unrecognised keys
    )


settings = Settings()

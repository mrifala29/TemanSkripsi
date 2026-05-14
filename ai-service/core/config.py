"""
Application settings — loaded from environment variables / .env file.

All model names, thresholds, and tuning constants live here.
Never scatter magic numbers across the codebase — reference settings instead.
"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # ── Supabase ───────────────────────────────────────────────────────────
    supabase_url: str
    supabase_service_role_key: str

    # ── Gemini / LangChain ─────────────────────────────────────────────────
    gemini_api_key: str
    chat_model: str = "gemini-1.5-flash"
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

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()

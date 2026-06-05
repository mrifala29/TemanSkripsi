"""
Dependency providers — singleton factories for Supabase client and LangChain models.

Usage in agents:
    from core.dependencies import get_supabase, get_llm, get_embeddings

Usage in FastAPI routes via DI:
    from fastapi import Depends
    def my_route(supabase = Depends(get_supabase)): ...
"""
from functools import lru_cache

from langchain_openai import ChatOpenAI
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from supabase import Client, create_client

from core.config import settings


@lru_cache(maxsize=1)
def get_supabase() -> Client:
    """Singleton Supabase client (service-role, bypasses RLS)."""
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


@lru_cache(maxsize=1)
def get_llm() -> ChatOpenAI:
    """Singleton LangChain LLM wrapper for OpenAI compatible APIs."""
    return ChatOpenAI(
        model=settings.llm_model,
        api_key=settings.llm_api_key,
        base_url=settings.llm_base_url,
        temperature=settings.llm_temperature,
    )


@lru_cache(maxsize=1)
def get_embeddings() -> GoogleGenerativeAIEmbeddings:
    """Singleton LangChain Embeddings wrapper for Gemini text-embedding-004."""
    return GoogleGenerativeAIEmbeddings(
        model=settings.embedding_model,
        google_api_key=settings.embedding_api_key,
        task_type="retrieval_query",
    )

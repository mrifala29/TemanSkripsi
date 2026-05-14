"""
Dependency providers — singleton factories for Supabase client and LangChain models.

Usage in agents:
    from core.dependencies import get_supabase, get_llm, get_embeddings

Usage in FastAPI routes via DI:
    from fastapi import Depends
    def my_route(supabase = Depends(get_supabase)): ...
"""
from functools import lru_cache

from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from supabase import Client, create_client

from core.config import settings


@lru_cache(maxsize=1)
def get_supabase() -> Client:
    """Singleton Supabase client (service-role, bypasses RLS)."""
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


@lru_cache(maxsize=1)
def get_llm() -> ChatGoogleGenerativeAI:
    """Singleton LangChain LLM wrapper for Gemini Flash."""
    return ChatGoogleGenerativeAI(
        model=settings.chat_model,
        google_api_key=settings.gemini_api_key,
        temperature=0.7,
        convert_system_message_to_human=True,
    )


@lru_cache(maxsize=1)
def get_embeddings() -> GoogleGenerativeAIEmbeddings:
    """Singleton LangChain Embeddings wrapper for Gemini text-embedding-004."""
    return GoogleGenerativeAIEmbeddings(
        model=settings.embedding_model,
        google_api_key=settings.gemini_api_key,
        task_type="retrieval_query",
    )

"""
Chunk retrieval from Supabase pgvector.

Uses LangChain GoogleGenerativeAIEmbeddings to generate query vectors,
then calls the match_document_chunks RPC for similarity search.

RPC reference (migration 004):
  match_document_chunks(query_embedding, match_document_id, match_count, match_threshold)
  match_similar_chunks(query_embedding, exclude_document_id, match_count, match_threshold)
"""
from __future__ import annotations

import logging

from langchain_google_genai import GoogleGenerativeAIEmbeddings
from supabase import Client

from core.config import settings

log = logging.getLogger(__name__)


def get_embedding(text: str, embeddings: GoogleGenerativeAIEmbeddings) -> list[float]:
    """Generate a retrieval embedding for a single query string."""
    return embeddings.embed_query(text)


def retrieve_chunks(
    supabase: Client,
    document_id: str,
    query: str,
    embeddings: GoogleGenerativeAIEmbeddings,
    top_k: int = settings.rag_top_k_analysis,
    threshold: float = settings.rag_threshold,
) -> list[dict]:
    """
    Retrieve top-k relevant chunks from a document via pgvector cosine similarity.

    Falls back to sequential chunk order if the RPC call fails
    (e.g. pgvector not configured, or function signature mismatch).
    """
    query_embedding = get_embedding(query, embeddings)

    try:
        result = supabase.rpc(
            "match_document_chunks",
            {
                "query_embedding":   query_embedding,
                "match_document_id": document_id,
                "match_count":       top_k,
                "match_threshold":   threshold,
            },
        ).execute()
        return result.data or []

    except Exception as exc:
        log.warning("pgvector RPC failed, falling back to sequential fetch: %s", exc)
        result = (
            supabase.table("document_chunks")
            .select("id, content, chunk_index")
            .eq("document_id", document_id)
            .order("chunk_index")
            .limit(top_k)
            .execute()
        )
        return result.data or []


def find_similar_chunks(
    supabase: Client,
    embedding: list[float],
    exclude_document_id: str,
    match_count: int = 5,
    threshold: float = settings.similarity_threshold,
) -> list[dict]:
    """
    Find chunks from OTHER documents that are similar to the given embedding.
    Used by the similarity/kesamaan feature.
    """
    try:
        result = supabase.rpc(
            "match_similar_chunks",
            {
                "query_embedding":    embedding,
                "exclude_document_id": exclude_document_id,
                "match_count":        match_count,
                "match_threshold":    threshold,
            },
        ).execute()
        return result.data or []

    except Exception as exc:
        log.warning("match_similar_chunks RPC failed: %s", exc)
        return []


def chunks_to_context(chunks: list[dict]) -> str:
    """Join chunk dicts into a single context string separated by dividers."""
    return "\n\n---\n\n".join(c["content"] for c in chunks)

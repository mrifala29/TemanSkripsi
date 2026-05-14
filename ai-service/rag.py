"""
DEPRECATED — this file is shadowed by the rag/ package.

All RAG utilities have moved to:
  rag/retriever.py  — get_embedding(), retrieve_chunks(), find_similar_chunks(), chunks_to_context()

This file exists only as a fallback shim and is not imported by any module.
"""

import logging
from supabase import Client

log = logging.getLogger(__name__)

EMBEDDING_MODEL = "models/text-embedding-004"
DEFAULT_TOP_K = 10
DEFAULT_THRESHOLD = 0.65


def get_embedding(text: str, genai) -> list[float]:
    """Generate a vector embedding for the given text."""
    result = genai.embed_content(
        model=EMBEDDING_MODEL,
        content=text,
        task_type="retrieval_query",
    )
    return result["embedding"]


def retrieve_chunks(
    supabase: Client,
    document_id: str,
    query: str,
    genai,
    top_k: int = DEFAULT_TOP_K,
    threshold: float = DEFAULT_THRESHOLD,
) -> list[dict]:
    """
    Retrieve top-k relevant chunks from a document via pgvector similarity search.

    Args:
        supabase:     Supabase client instance.
        document_id:  UUID of the target document.
        query:        Query string — typically the thesis title or a user question.
        genai:        Configured google.generativeai module.
        top_k:        Maximum number of chunks to return.
        threshold:    Minimum cosine similarity score (0–1).

    Returns:
        List of chunk dicts with keys: id, content, chunk_index.
    """
    query_embedding = get_embedding(query, genai)

    try:
        result = supabase.rpc(
            "match_document_chunks",
            {
                "query_embedding": query_embedding,
                "match_document": document_id,
                "match_count": top_k,
                "match_threshold": threshold,
            },
        ).execute()
        return result.data or []

    except Exception as e:
        log.warning("pgvector RPC failed, falling back to sequential fetch: %s", e)
        result = (
            supabase.table("document_chunks")
            .select("id, content, chunk_index")
            .eq("document_id", document_id)
            .order("chunk_index")
            .limit(top_k)
            .execute()
        )
        return result.data or []


def chunks_to_context(chunks: list[dict]) -> str:
    """Combine a list of chunk dicts into a single context string."""
    return "\n\n---\n\n".join(c["content"] for c in chunks)

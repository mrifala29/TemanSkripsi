"""
Document chunking and embedding pipeline.

Responsibilities:
  - Split extracted text into overlapping fixed-size chunks
  - Generate vector embeddings via LangChain/Gemini
  - Batch-insert chunks into Supabase document_chunks table
"""
from __future__ import annotations

import logging

from langchain_google_genai import GoogleGenerativeAIEmbeddings
from supabase import Client

from core.config import settings

log = logging.getLogger(__name__)


def chunk_text(text: str) -> list[str]:
    """
    Split text into overlapping fixed-size character chunks.

    Uses settings.chunk_size and settings.chunk_overlap.
    """
    chunks: list[str] = []
    start = 0
    while start < len(text):
        chunk = text[start : start + settings.chunk_size].strip()
        if chunk:
            chunks.append(chunk)
        start += settings.chunk_size - settings.chunk_overlap
    return chunks


def embed_and_store(
    supabase: Client,
    embeddings: GoogleGenerativeAIEmbeddings,
    document_id: str,
    chunks: list[str],
) -> int:
    """
    Generate embeddings for every chunk and insert them into document_chunks.

    Processes in batches of settings.embed_batch_size to stay within
    Supabase request size limits and Gemini rate limits.

    Returns:
        Number of chunks stored.
    """
    rows: list[dict] = []
    for i, chunk in enumerate(chunks):
        # embed_documents accepts a list; use single-item list per chunk
        vector = embeddings.embed_documents([chunk])[0]
        rows.append(
            {
                "document_id": document_id,
                "chunk_index": i,
                "content":     chunk,
                "embedding":   vector,
            }
        )

    batch = settings.embed_batch_size
    for start in range(0, len(rows), batch):
        supabase.table("document_chunks").insert(rows[start : start + batch]).execute()

    log.info("Stored %d chunks for document %s", len(rows), document_id)
    return len(rows)

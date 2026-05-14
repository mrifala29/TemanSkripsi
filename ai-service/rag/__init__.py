"""
RAG package — chunk retrieval and context formatting.
"""
from rag.retriever import chunks_to_context, get_embedding, retrieve_chunks

__all__ = ["get_embedding", "retrieve_chunks", "chunks_to_context"]

"""
Simulation Agent — AI acts as a thesis examiner in a Q&A session.

Flow (start):
  1. RAG: retrieve top-k chunks using thesis title
  2. Build prompt with mode="start"
  3. LangChain chain → first examiner question

Flow (message):
  1. RAG: retrieve top-k chunks using student's latest answer as query
  2. Inject chat history via core.memory.history_to_text
  3. Build prompt with mode="message"
  4. LangChain chain → next question or follow-up
"""
from __future__ import annotations

import logging

from langchain_core.messages import HumanMessage
from langchain_core.output_parsers import JsonOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from supabase import Client

from core.config import settings
from core.memory import history_to_text
from prompts.loader import PromptLoader
from rag.retriever import chunks_to_context, retrieve_chunks
from schemas.requests import SimulationMessageRequest, SimulationStartRequest
from schemas.responses import SimulationMessageResponse, SimulationStartResponse

log = logging.getLogger(__name__)


class SimulasiAgent:
    """
    LangChain-powered agent simulating a thesis defence examiner.

    Each request is stateless from the agent's perspective — chat history
    is passed in by the caller from the database.
    """

    def __init__(
        self,
        supabase: Client,
        llm: ChatGoogleGenerativeAI,
        embeddings: GoogleGenerativeAIEmbeddings,
    ):
        self.supabase   = supabase
        self.embeddings = embeddings
        self.loader     = PromptLoader()
        self.chain      = llm | JsonOutputParser()

    # ──────────────────────────────────────────────────────────────────────
    # Public API
    # ──────────────────────────────────────────────────────────────────────

    def start(self, req: SimulationStartRequest) -> SimulationStartResponse:
        """Generate the opening question for a new simulation session."""
        ctx = req.context

        chunks = retrieve_chunks(
            supabase=self.supabase,
            document_id=ctx.document_id,
            query=ctx.judul_skripsi,
            embeddings=self.embeddings,
            top_k=settings.rag_top_k_simulation_start,
        )

        prompt = self.loader.build_prompt(
            service="simulasi",
            major=ctx.major,
            jurusan=ctx.jurusan,
            variables={
                "judul_skripsi":  ctx.judul_skripsi,
                "chunks_context": chunks_to_context(chunks),
                "chat_history":   "",
                "user_message":   "",
                "mode":           "start",
            },
        )

        data: dict = self.chain.invoke([HumanMessage(content=prompt)])
        return SimulationStartResponse(
            session_id=req.session_id,
            question=data.get("question", ""),
            turn=1,
        )

    def message(self, req: SimulationMessageRequest) -> SimulationMessageResponse:
        """Process a student answer and return the next examiner question."""
        ctx = req.context

        # Use the student's answer as a targeted RAG query
        chunks = retrieve_chunks(
            supabase=self.supabase,
            document_id=ctx.document_id,
            query=req.user_message,
            embeddings=self.embeddings,
            top_k=settings.rag_top_k_simulation_message,
        )

        prompt = self.loader.build_prompt(
            service="simulasi",
            major=ctx.major,
            jurusan=ctx.jurusan,
            variables={
                "judul_skripsi":  ctx.judul_skripsi,
                "chunks_context": chunks_to_context(chunks),
                "chat_history":   history_to_text(req.chat_history),
                "user_message":   req.user_message,
                "mode":           "message",
            },
        )

        data: dict = self.chain.invoke([HumanMessage(content=prompt)])
        turn = len(req.chat_history) + 1

        return SimulationMessageResponse(
            session_id=req.session_id,
            ai_message=data.get("question", ""),
            is_followup=bool(data.get("is_followup", False)),
            turn=turn,
        )

"""
DEPRECATED — moved to agents/simulasi_agent.py

SimulasiService has been replaced by SimulasiAgent which uses LangChain LCEL
and core/memory.py for conversation history formatting.
See agents/simulasi_agent.py for the current implementation.
"""

import json
import logging
import re

import google.generativeai as genai
from supabase import Client

from rag import retrieve_chunks, chunks_to_context
from prompts.loader import PromptLoader
from schemas import (
    SimulationStartRequest,
    SimulationStartResponse,
    SimulationMessageRequest,
    SimulationMessageResponse,
)

log = logging.getLogger(__name__)

CHAT_MODEL = "gemini-1.5-flash"


class SimulasiService:
    def __init__(self, supabase: Client, model_name: str = CHAT_MODEL):
        self.supabase = supabase
        self.model = genai.GenerativeModel(model_name)
        self.loader = PromptLoader()

    def start(self, req: SimulationStartRequest) -> SimulationStartResponse:
        """Generate the opening question to kick off a simulation session."""
        ctx = req.context

        chunks = retrieve_chunks(
            supabase=self.supabase,
            document_id=ctx.document_id,
            query=ctx.judul_skripsi,
            genai=genai,
            top_k=8,
        )
        chunks_context = chunks_to_context(chunks)

        prompt = self.loader.build_prompt(
            service="simulasi",
            major=ctx.major,
            jurusan=ctx.jurusan,
            variables={
                "judul_skripsi": ctx.judul_skripsi,
                "chunks_context": chunks_context,
                "chat_history": "",
                "user_message": "",
                "mode": "start",
            },
        )

        response = self.model.generate_content(prompt)
        raw = response.text.strip()
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        data = json.loads(match.group()) if match else {"question": raw}

        return SimulationStartResponse(
            session_id=req.session_id,
            question=data.get("question", raw),
            turn=1,
        )

    def message(self, req: SimulationMessageRequest) -> SimulationMessageResponse:
        """Generate a follow-up question based on the user's latest answer."""
        ctx = req.context

        # Use user's answer as query for more targeted chunk retrieval
        chunks = retrieve_chunks(
            supabase=self.supabase,
            document_id=ctx.document_id,
            query=req.user_message,
            genai=genai,
            top_k=5,
        )
        chunks_context = chunks_to_context(chunks)

        # Keep only last 6 turns to control context size
        history_text = "\n".join(
            f"{m['role'].upper()}: {m['content']}"
            for m in req.chat_history[-6:]
        )

        prompt = self.loader.build_prompt(
            service="simulasi",
            major=ctx.major,
            jurusan=ctx.jurusan,
            variables={
                "judul_skripsi": ctx.judul_skripsi,
                "chunks_context": chunks_context,
                "chat_history": history_text,
                "user_message": req.user_message,
                "mode": "message",
            },
        )

        response = self.model.generate_content(prompt)
        raw = response.text.strip()
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        data = json.loads(match.group()) if match else {"ai_message": raw, "is_followup": False}

        turn = len(req.chat_history) + 1

        return SimulationMessageResponse(
            session_id=req.session_id,
            ai_message=data.get("ai_message", raw),
            is_followup=bool(data.get("is_followup", False)),
            turn=turn,
        )

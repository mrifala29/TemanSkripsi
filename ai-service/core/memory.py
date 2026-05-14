"""
Conversation memory utilities for the simulation feature.

Converts raw chat history (list of dicts from DB / frontend)
into LangChain-compatible message objects and plain-text dialogue
strings for injecting into prompts.
"""
from __future__ import annotations

from langchain_core.messages import AIMessage, BaseMessage, HumanMessage

from core.config import settings


def history_to_messages(chat_history: list[dict]) -> list[BaseMessage]:
    """
    Convert a flat chat history list to LangChain message objects.

    Input format: [{"role": "assistant"|"user", "content": "..."}]
    Only the last `chat_history_window * 2` entries are returned to
    keep context size bounded.
    """
    messages: list[BaseMessage] = []
    window = settings.chat_history_window * 2
    for turn in chat_history[-window:]:
        role = turn.get("role", "user")
        content = turn.get("content", "").strip()
        if role == "assistant":
            messages.append(AIMessage(content=content))
        else:
            messages.append(HumanMessage(content=content))
    return messages


def history_to_text(chat_history: list[dict]) -> str:
    """
    Format chat history as a readable dialogue string for prompt injection.

    Returns an empty string when history is empty.
    Format: "DOSEN: <question>\\nMAHASISWA: <answer>\\n..."
    """
    lines: list[str] = []
    window = settings.chat_history_window
    for turn in chat_history[-window:]:
        role = "DOSEN" if turn.get("role") == "assistant" else "MAHASISWA"
        lines.append(f"{role}: {turn.get('content', '').strip()}")
    return "\n".join(lines)

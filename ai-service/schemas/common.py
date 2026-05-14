"""
Shared input context model used across all AI endpoints.
"""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel


class DocumentContext(BaseModel):
    """
    Shared document context passed to every AI endpoint.

    `major` and `jurusan` map directly to the prompt directory structure:
      prompts/fakultas/{major}/{jurusan}.md
    """

    document_id: str
    major: str          # folder slug, e.g. "pendidikan", "hukum", "bisnis", "teknologi"
    jurusan: str        # file slug, e.g. "pendidikan-matematika", "hukum-pidana"
    judul_skripsi: str  # full thesis title — used as RAG query & injected into prompts
    bab_fokus: Optional[str] = None  # optional: narrow RAG to a specific chapter

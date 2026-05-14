"""
Prompt Loader — assembles the final prompt from 3 layers:

  1. prompts/system/base.md       — general academic examiner persona
  2. prompts/fakultas/{major}/{jurusan}.md — jurusan-specific focus & terminology
  3. prompts/services/{service}.md — task instructions & output schema

Final prompt = [system base] + [fakultas context] + [service task]

Template variables use {variable_name} syntax. Literal curly braces in
prompt files (e.g. inside JSON examples) are safe because replacement is
done with str.replace(), not str.format().
"""

import logging
from functools import lru_cache
from pathlib import Path

log = logging.getLogger(__name__)

PROMPTS_DIR = Path(__file__).parent


class PromptLoader:
    def build_prompt(
        self,
        service: str,    # "analisis" | "simulasi" | "kesamaan"
        major: str,      # e.g. "pendidikan", "hukum", "bisnis"
        jurusan: str,    # e.g. "pendidikan-matematika", "hukum-pidana"
        variables: dict, # Template vars: judul_skripsi, chunks_context, etc.
    ) -> str:
        """Assemble the final prompt and interpolate template variables."""
        system   = self._load_system()
        fakultas = self._load_fakultas(major, jurusan)
        task     = self._load_service(service)

        combined = "\n\n".join(part for part in [system, fakultas, task] if part)
        return self._interpolate(combined, variables)

    # ──────────────────────────────────────────
    # Loaders (cached to avoid repeated disk I/O)
    # ──────────────────────────────────────────

    @lru_cache(maxsize=4)
    def _load_system(self) -> str:
        return self._read(PROMPTS_DIR / "system" / "base.md")

    @lru_cache(maxsize=64)
    def _load_fakultas(self, major: str, jurusan: str) -> str:
        major_slug   = major.lower().replace(" ", "_")
        jurusan_slug = jurusan.lower().replace(" ", "-")

        # Primary: exact match
        path = PROMPTS_DIR / "fakultas" / major_slug / f"{jurusan_slug}.md"
        if path.exists():
            return self._read(path)

        # Fallback 1: first .md file in the major folder
        major_dir = PROMPTS_DIR / "fakultas" / major_slug
        if major_dir.exists():
            files = sorted(major_dir.glob("*.md"))
            if files:
                log.warning(
                    "Jurusan '%s' not found in '%s', using '%s' as fallback",
                    jurusan_slug, major_slug, files[0].name,
                )
                return self._read(files[0])

        # Fallback 2: generic default
        log.warning("Major '%s' not found, using default prompt", major_slug)
        return self._read(PROMPTS_DIR / "fakultas" / "default" / "default.md")

    @lru_cache(maxsize=8)
    def _load_service(self, service: str) -> str:
        return self._read(PROMPTS_DIR / "services" / f"{service}.md")

    # ──────────────────────────────────────────
    # Utilities
    # ──────────────────────────────────────────

    @staticmethod
    def _read(path: Path) -> str:
        try:
            return path.read_text(encoding="utf-8").strip()
        except FileNotFoundError:
            log.error("Prompt file not found: %s", path)
            return ""

    @staticmethod
    def _interpolate(template: str, variables: dict) -> str:
        """
        Replace {key} placeholders with values.
        Uses str.replace to avoid issues with literal braces in JSON examples.
        """
        result = template
        for key, value in variables.items():
            result = result.replace(f"{{{key}}}", str(value))
        return result

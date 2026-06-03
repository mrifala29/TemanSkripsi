"""
Prompt Loader — assembles the final prompt from 3 layers:

  1. prompts/system/base.md                 — general academic examiner persona
  2. prompts/fakultas/{major}/{jurusan}.md  — jurusan-specific focus & terminology
  3. prompts/services/{service}/{task}.md   — task instructions & output schema

For the analisis service, an additional eval sub-prompt is appended based on
document_type:
  - "proposal"      → services/analisis/proposal-eval.md      (5 aspects)
  - "final_report"  → services/analisis/laporanakhir-eval.md  (7 aspects)

Final prompt = [system base] + [fakultas context] + [service task] [+ eval sub-prompt]

Template variables use {variable_name} syntax. Literal curly braces in
prompt files (e.g. inside JSON examples) are safe because replacement is
done with str.replace(), not str.format().
"""

import logging
from functools import lru_cache
from pathlib import Path
from typing import Optional

log = logging.getLogger(__name__)

PROMPTS_DIR = Path(__file__).parent


class PromptLoader:
    def build_prompt(
        self,
        service: str,                        # "analisis" | "simulasi" | "kesamaan"
        major: str,                          # e.g. "pendidikan", "hukum", "bisnis"
        jurusan: str,                        # e.g. "pendidikan-matematika", "hukum-pidana"
        variables: dict,                     # Template vars: judul_skripsi, chunks_context, etc.
        document_type: Optional[str] = None, # "proposal" | "final_report" — required for analisis
    ) -> str:
        """Assemble the final prompt and interpolate template variables."""
        system   = self._load_system()
        fakultas = self._load_fakultas(major, jurusan)
        task     = self._load_service_task(service, document_type)

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

    def _load_service_task(self, service: str, document_type: Optional[str]) -> str:
        """
        Load the service prompt(s).

        For 'analisis', combines the general framing (analisis.md) with the
        appropriate eval sub-prompt based on document_type:
          - "proposal"     → proposal-eval.md
          - "final_report" → laporanakhir-eval.md

        For other services, loads {service}/{service}.md with fallback to
        the legacy flat file {service}.md.
        """
        if service == "analisis":
            base = self._load_file(f"services/analisis/analisis")
            if document_type == "proposal":
                eval_part = self._load_file("services/analisis/proposal-eval")
            else:
                # Default to laporan akhir (final_report or unknown)
                eval_part = self._load_file("services/analisis/laporanakhir-eval")
            return "\n\n".join(p for p in [base, eval_part] if p)

        # Subdirectory layout first: services/{service}/{service}.md
        subdir_path = self._load_file(f"services/{service}/{service}")
        if subdir_path:
            return subdir_path

        # Fallback: legacy flat layout services/{service}.md
        log.warning("Service prompt not found in subdir for '%s', trying flat layout", service)
        return self._load_file(f"services/{service}")

    @lru_cache(maxsize=16)
    def _load_file(self, path_slug: str) -> str:
        """Load a .md file relative to PROMPTS_DIR by its slug (no extension)."""
        return self._read(PROMPTS_DIR / f"{path_slug}.md")

    def build_typo_prompt(self, pages_text: str) -> str:
        """
        Build a standalone typo-detection prompt from
        services/kesamaan/typo_check.md.

        Unlike build_prompt(), this does NOT prepend system/base.md or a
        fakultas layer — typo detection is language-agnostic and doesn't
        need the examiner persona.
        """
        template = self._load_file("services/kesamaan/typo_check")
        return self._interpolate(template, {"pages_text": pages_text})

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

"""
Gemini LLM service.

Uses the official `google-genai` SDK. The client is created once and
reused. If GEMINI_API_KEY is missing, `is_configured()` returns False and
callers (rag_service) must surface a clear configuration error to the
frontend rather than crash or silently fabricate an answer.
"""
from __future__ import annotations

import logging
import threading
from typing import Optional

from tenacity import retry, stop_after_attempt, wait_exponential

from app.config import get_settings

logger = logging.getLogger("ip_sakti.llm")


class GeminiConfigError(Exception):
    """Raised when Gemini is invoked without a configured API key."""


class LLMService:
    _instance: Optional["LLMService"] = None
    _lock = threading.Lock()

    def __init__(self) -> None:
        self._client = None
        self._client_lock = threading.Lock()

    @classmethod
    def instance(cls) -> "LLMService":
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = LLMService()
        return cls._instance

    def is_configured(self) -> bool:
        return get_settings().gemini_configured

    def _get_client(self):
        if self._client is not None:
            return self._client
        with self._client_lock:
            if self._client is not None:
                return self._client
            settings = get_settings()
            if not settings.gemini_configured:
                raise GeminiConfigError(
                    "GEMINI_API_KEY is not set. Add it to backend/.env to enable AI-generated answers."
                )
            from google import genai  # local import so the package is optional until actually used

            self._client = genai.Client(api_key=settings.gemini_api_key)
            return self._client

    @retry(stop=stop_after_attempt(2), wait=wait_exponential(multiplier=1, min=1, max=4), reraise=True)
    def generate(self, system_prompt: str, user_prompt: str, temperature: float = 0.2) -> str:
        """Generate a response from Gemini. Raises GeminiConfigError if unconfigured,
        or the underlying SDK exception if the call fails after retries."""
        settings = get_settings()
        client = self._get_client()
        from google.genai import types  # local import, optional dependency

        response = client.models.generate_content(
            model=settings.gemini_model,
            contents=user_prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                temperature=temperature,
                max_output_tokens=1024,
            ),
        )
        text = getattr(response, "text", None)
        if not text:
            raise RuntimeError("Gemini returned an empty response")
        return text


def get_llm_service() -> LLMService:
    return LLMService.instance()

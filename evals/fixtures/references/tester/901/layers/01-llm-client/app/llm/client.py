"""Thin client for an OpenAI Chat Completions-compatible API."""

import json
import math
import urllib.error
import urllib.request

import app.settings
from app.llm.types import Completion, LLMError, RateLimitError

DEFAULT_RETRY_AFTER = 60.0


def _retry_after(value):
    try:
        seconds = float(value)
    except (TypeError, ValueError):
        return DEFAULT_RETRY_AFTER
    if not math.isfinite(seconds) or seconds < 0:
        return DEFAULT_RETRY_AFTER
    return seconds


class LLMClient:
    def __init__(self, *, api_key: str, base_url: str, model: str, timeout: float = 30.0):
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.model = model
        self.timeout = timeout

    def complete(self, messages: list[dict], *, max_tokens: int) -> Completion:
        body = json.dumps(
            {"model": self.model, "messages": messages, "max_tokens": max_tokens}
        ).encode("utf-8")
        request = urllib.request.Request(
            f"{self.base_url}/chat/completions",
            data=body,
            method="POST",
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            },
        )
        try:
            with urllib.request.urlopen(request, timeout=self.timeout) as response:
                payload = json.load(response)
        except urllib.error.HTTPError as error:
            if error.code == 429:
                raise RateLimitError(_retry_after(error.headers.get("Retry-After"))) from error
            raise LLMError(f"provider returned HTTP {error.code}") from error
        except (urllib.error.URLError, TimeoutError) as error:
            raise LLMError(f"provider request failed: {error}") from error
        try:
            choice = payload["choices"][0]
            message = choice["message"]
            return Completion(
                text=message.get("content"),
                finish_reason=choice["finish_reason"],
                refusal=message.get("refusal"),
            )
        except (KeyError, IndexError, TypeError) as error:
            raise LLMError("unexpected response shape from provider") from error


def default_client() -> LLMClient:
    config = app.settings.settings
    return LLMClient(
        api_key=config.llm_api_key,
        base_url=config.llm_base_url,
        model=config.llm_model,
    )

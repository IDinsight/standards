"""Thin wrapper around the provider SDK.

Routes receive an ``LLMClient`` through the ``get_llm_client`` dependency and
work only with the types defined here, never with SDK objects.
"""

from dataclasses import dataclass, field
from typing import Any

import openai

from app.utils.config import settings


@dataclass
class ToolCall:
    name: str
    # The arguments exactly as the provider sent them: a JSON string that is
    # not guaranteed to be valid JSON.
    arguments: str


@dataclass
class Completion:
    text: str | None
    tool_calls: list[ToolCall] = field(default_factory=list)
    finish_reason: str | None = None


class LLMError(Exception):
    """The provider call did not produce a usable response."""


class RateLimitedError(LLMError):
    def __init__(self, retry_after: int):
        super().__init__(f"rate limited; retry after {retry_after}s")
        self.retry_after = retry_after


class ProviderUnavailableError(LLMError):
    """Timeout, connection failure, or a 5xx response from the provider."""


def _retry_after(response: Any) -> int:
    value = response.headers.get("retry-after") if response is not None else None
    try:
        return max(1, round(float(value)))
    except (TypeError, ValueError):
        return settings.llm_default_retry_after_seconds


class LLMClient:
    def __init__(self, api_key: str | None, model: str, timeout: float):
        # Retries are left to callers so a rate limit surfaces immediately.
        self._sdk = openai.AsyncOpenAI(api_key=api_key, timeout=timeout, max_retries=0)
        self.model = model

    async def complete(
        self,
        *,
        messages: list[dict],
        tools: list[dict] | None = None,
        tool_choice: Any = None,
    ) -> Completion:
        request: dict[str, Any] = {"model": self.model, "messages": messages}
        if tools:
            request["tools"] = tools
        if tool_choice is not None:
            request["tool_choice"] = tool_choice
        try:
            response = await self._sdk.chat.completions.create(**request)
        except openai.RateLimitError as exc:
            raise RateLimitedError(_retry_after(exc.response)) from exc
        except (openai.APITimeoutError, openai.APIConnectionError, openai.InternalServerError) as exc:
            raise ProviderUnavailableError(str(exc)) from exc
        except openai.APIStatusError as exc:
            raise LLMError(f"provider returned {exc.status_code}") from exc
        choice = response.choices[0]
        calls = [
            ToolCall(name=call.function.name, arguments=call.function.arguments)
            for call in choice.message.tool_calls or []
            if call.type == "function"
        ]
        return Completion(text=choice.message.content, tool_calls=calls, finish_reason=choice.finish_reason)


def get_llm_client() -> LLMClient:
    return LLMClient(settings.llm_api_key, settings.llm_model, settings.llm_timeout_seconds)

"""Results and errors returned by the provider client."""

from dataclasses import dataclass


@dataclass(frozen=True)
class Completion:
    text: str | None
    finish_reason: str
    refusal: str | None


class LLMError(Exception):
    """The provider call failed or returned something the worker cannot use."""


class RateLimitError(LLMError):
    """The provider limited the request rate; retry after retry_after seconds."""

    def __init__(self, retry_after: float, message: str = "rate limited by provider"):
        super().__init__(message)
        self.retry_after = retry_after

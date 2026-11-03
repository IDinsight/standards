"""Thin client for the hosted LLM.

This is the only module that talks to the provider. Routes receive an
``LLMClient`` through the ``get_llm_client`` dependency and handle the
``LLMError`` subclasses defined here.
"""

import json
import os
import urllib.error
import urllib.request

DEFAULT_BASE_URL = "https://api.anthropic.com"
DEFAULT_MODEL = "claude-haiku-4-5"
API_VERSION = "2023-06-01"


class LLMError(Exception):
    """Base class for every failure the client reports."""


class LLMTimeoutError(LLMError):
    """The provider did not answer within the configured timeout."""


class LLMConnectionError(LLMError):
    """The provider could not be reached."""


class LLMRateLimitError(LLMError):
    """The provider rejected the request with HTTP 429."""

    def __init__(self, message, retry_after=None):
        super().__init__(message)
        self.retry_after = retry_after


class LLMAuthError(LLMError):
    """The provider rejected the credentials (HTTP 401 or 403)."""


class LLMBadRequestError(LLMError):
    """The provider rejected the request (any other HTTP 4xx)."""


class LLMServerError(LLMError):
    """The provider failed with HTTP 5xx."""


class LLMMalformedResponseError(LLMError):
    """The response could not be parsed or contained no text."""


class LLMTruncatedError(LLMError):
    """The model stopped at the token limit before finishing."""


class LLMRefusalError(LLMError):
    """The model declined to answer."""


ERROR_TYPES = (
    LLMTimeoutError,
    LLMConnectionError,
    LLMRateLimitError,
    LLMAuthError,
    LLMBadRequestError,
    LLMServerError,
    LLMMalformedResponseError,
    LLMTruncatedError,
    LLMRefusalError,
)


def _urllib_transport(url, headers, data, timeout):
    request = urllib.request.Request(url, data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            return response.status, dict(response.headers), response.read()
    except urllib.error.HTTPError as exc:
        return exc.code, dict(exc.headers or {}), exc.read()
    except urllib.error.URLError as exc:
        if isinstance(exc.reason, TimeoutError):
            raise TimeoutError(str(exc.reason)) from exc
        raise ConnectionError(str(exc.reason)) from exc


def _retry_after(headers):
    value = {key.lower(): item for key, item in headers.items()}.get("retry-after")
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


class LLMClient:
    def __init__(self, api_key, model=DEFAULT_MODEL, base_url=DEFAULT_BASE_URL, timeout=20.0, transport=None):
        self.api_key = api_key
        self.model = model
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self._transport = transport or _urllib_transport

    def summarize(self, text, max_words=80):
        """Return a summary of ``text`` in at most ``max_words`` words."""
        prompt = f"Summarize this note in at most {max_words} words. Reply with the summary only.\n\n{text}"
        status, headers, body = self._post(
            {"model": self.model, "max_tokens": 400, "messages": [{"role": "user", "content": prompt}]}
        )
        self._raise_for_status(status, headers)
        return self._read_text(body)

    def _post(self, payload):
        headers = {"content-type": "application/json", "x-api-key": self.api_key, "anthropic-version": API_VERSION}
        try:
            return self._transport(f"{self.base_url}/v1/messages", headers, json.dumps(payload).encode(), self.timeout)
        except TimeoutError as exc:
            raise LLMTimeoutError(f"no response within {self.timeout} seconds") from exc
        except OSError as exc:
            raise LLMConnectionError(str(exc)) from exc

    @staticmethod
    def _raise_for_status(status, headers):
        if status == 429:
            raise LLMRateLimitError("rate limited by the provider", retry_after=_retry_after(headers))
        if status in (401, 403):
            raise LLMAuthError(f"provider rejected credentials ({status})")
        if status >= 500:
            raise LLMServerError(f"provider error ({status})")
        if status >= 400:
            raise LLMBadRequestError(f"provider rejected the request ({status})")

    @staticmethod
    def _read_text(body):
        try:
            data = json.loads(body)
            text = "".join(block["text"] for block in data["content"] if block.get("type") == "text")
            stop_reason = data.get("stop_reason")
        except (ValueError, KeyError, TypeError, AttributeError) as exc:
            raise LLMMalformedResponseError("unreadable provider response") from exc
        if stop_reason == "refusal":
            raise LLMRefusalError("the model declined to summarize")
        if stop_reason == "max_tokens":
            raise LLMTruncatedError("the summary was cut off at the token limit")
        if not text.strip():
            raise LLMMalformedResponseError("the provider returned no text")
        return text.strip()


def get_llm_client():
    return LLMClient(
        api_key=os.environ["LLM_API_KEY"],
        model=os.environ.get("LLM_MODEL", DEFAULT_MODEL),
        base_url=os.environ.get("LLM_BASE_URL", DEFAULT_BASE_URL),
        timeout=float(os.environ.get("LLM_TIMEOUT_SECONDS", "20")),
    )

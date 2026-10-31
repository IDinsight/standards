import json

import pytest

from app.llm.client import LLMClient, LLMRateLimitError, LLMTimeoutError


def respond(status, body, headers=None):
    def transport(url, request_headers, data, timeout):
        return status, headers or {}, json.dumps(body).encode()

    return transport


def test_summarize_joins_text_blocks():
    client = LLMClient(
        api_key="test-key",
        transport=respond(200, {"content": [{"type": "text", "text": " Two visits. "}], "stop_reason": "end_turn"}),
    )
    assert client.summarize("note") == "Two visits."


def test_rate_limit_carries_retry_after():
    client = LLMClient(
        api_key="test-key",
        transport=respond(429, {"error": {"type": "rate_limit_error"}}, {"retry-after": "30"}),
    )
    with pytest.raises(LLMRateLimitError) as caught:
        client.summarize("note")
    assert caught.value.retry_after == 30


def test_transport_timeout_raises_llm_timeout():
    def slow(url, request_headers, data, timeout):
        raise TimeoutError("timed out")

    with pytest.raises(LLMTimeoutError):
        LLMClient(api_key="test-key", transport=slow).summarize("note")

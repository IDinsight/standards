"""Streaming client for the team's model gateway.

The gateway exposes the Messages API. With "stream": true it answers with
server-sent events; stream_message yields each event's data as a dict,
unchanged, in the order the gateway sends them.
"""
from __future__ import annotations

import json
import urllib.request
from collections.abc import Iterable, Iterator

from app.settings import settings

ANTHROPIC_VERSION = "2023-06-01"


class GatewayClient:
    def __init__(self, *, base_url: str, api_key: str, model: str, timeout: float = 60.0):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.model = model
        self.timeout = timeout

    def stream_message(self, *, messages: list[dict], tools: list[dict], max_tokens: int) -> Iterator[dict]:
        body = {
            "model": self.model,
            "max_tokens": max_tokens,
            "messages": messages,
            "tools": tools,
            "stream": True,
        }
        request = urllib.request.Request(
            f"{self.base_url}/v1/messages",
            data=json.dumps(body).encode("utf-8"),
            method="POST",
            headers={
                "content-type": "application/json",
                "accept": "text/event-stream",
                "x-api-key": self.api_key,
                "anthropic-version": ANTHROPIC_VERSION,
            },
        )
        with urllib.request.urlopen(request, timeout=self.timeout) as response:
            yield from iter_event_data(response)


def iter_event_data(lines: Iterable[bytes]) -> Iterator[dict]:
    """Yield the JSON data of each complete server-sent event."""
    data_lines: list[str] = []
    for raw in lines:
        line = raw.decode("utf-8").rstrip("\r\n")
        if not line:
            if data_lines:
                yield json.loads("\n".join(data_lines))
                data_lines = []
            continue
        if line.startswith(":"):
            continue
        name, _, value = line.partition(":")
        if value.startswith(" "):
            value = value[1:]
        if name == "data":
            data_lines.append(value)


def default_client() -> GatewayClient:
    return GatewayClient(
        base_url=settings.llm_gateway_url,
        api_key=settings.llm_gateway_key,
        model=settings.llm_model,
    )

"""Extract invoice records from streamed record_invoice tool calls."""
from __future__ import annotations

import json
from dataclasses import dataclass

from app.settings import settings

RECORD_INVOICE_TOOL = {
    "name": "record_invoice",
    "description": "Record the fields of one supplier invoice.",
    "input_schema": {
        "type": "object",
        "properties": {
            "invoice_number": {"type": "string"},
            "vendor": {"type": "string"},
            "issue_date": {"type": "string", "description": "ISO 8601 date"},
            "currency": {"type": "string", "description": "ISO 4217 code"},
            "total": {"type": "number"},
        },
        "required": ["invoice_number", "vendor", "total"],
    },
}

PROMPT = (
    "Read the invoice below and call the record_invoice tool once with its fields. "
    "Leave out any optional field that does not appear in the document.\n\n"
)


@dataclass(frozen=True)
class ExtractResult:
    status: str
    record: dict | None


def extract_invoice(document_id: str, text: str, *, client, store) -> ExtractResult:
    messages = [{"role": "user", "content": PROMPT + text}]
    events = client.stream_message(
        messages=messages,
        tools=[RECORD_INVOICE_TOOL],
        max_tokens=settings.extract_max_tokens,
    )
    tool_index = None
    pieces = []
    stop_reason = None
    for event in events:
        event_type = event.get("type")
        if event_type == "error":
            return ExtractResult("retryable", None)
        if event_type == "content_block_start":
            block = event.get("content_block", {})
            if block.get("type") == "tool_use" and block.get("name") == "record_invoice":
                tool_index = event.get("index")
        elif event_type == "content_block_delta":
            delta = event.get("delta", {})
            if delta.get("type") == "input_json_delta" and event.get("index") == tool_index:
                pieces.append(delta.get("partial_json", ""))
        elif event_type == "message_delta":
            stop_reason = event.get("delta", {}).get("stop_reason")
        elif event_type == "message_stop":
            if stop_reason == "max_tokens":
                return ExtractResult("invalid", None)
            try:
                record = json.loads("".join(pieces))
            except json.JSONDecodeError:
                return ExtractResult("invalid", None)
            store.save_invoice(document_id, record)
            return ExtractResult("stored", record)
    return ExtractResult("retryable", None)

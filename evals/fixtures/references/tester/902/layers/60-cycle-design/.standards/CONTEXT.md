# Project Context

## Project Baseline

- invoice-intake turns supplier invoice documents into structured invoice
  records. Before this cycle it has a SQLite-backed invoice store and a
  streaming client for the team's model gateway; nothing calls the client yet.

## Stack and Tooling

- Python 3.11+ (`requires-python = ">=3.11"` in `pyproject.toml`), standard
  library only (`dependencies = []`). No third-party packages are installed or
  expected.
- pytest is the test runner, configured in `pyproject.toml`
  (`testpaths = ["tests"]`, `pythonpath = ["."]`).

## Structure and Boundaries

- `app/settings.py` — `Settings` dataclass and a module-level `settings`
  instance built once at import: `llm_gateway_url`, `llm_gateway_key`,
  `llm_model`, `extract_max_tokens` (default 1024), `database_path`.
- `app/llm/client.py` — `GatewayClient(*, base_url, api_key, model,
  timeout=60.0)`; `stream_message(*, messages, tools, max_tokens)` POSTs to
  `{base_url}/v1/messages` with `"stream": true` and yields each server-sent
  event's data as a dict, unchanged. `default_client()` builds a client from
  `settings` when called.
- `app/extract/store.py` — `InvoiceStore(db_path)` with
  `save_invoice(document_id, record)` and `get_invoice(document_id)`; records
  are stored as JSON text keyed by document ID.
- `tests/` — pytest tests; currently `tests/test_store.py`.

## Commands

- `python3 -m pytest` — runs the test suite from the project root.

## Conventions and Constraints

- Settings are read once when `app.settings` is imported; environment variables
  win over `.env`. `.env` is gitignored and absent from the repository;
  `.env.example` documents the variables. `LLM_GATEWAY_KEY` is empty by
  default.
- Collaborators are passed in explicitly: the store takes its database path,
  and the client takes its URL, key, and model. No module opens a connection at
  import.

## External Systems and Data

- Model gateway at `https://llm-gateway.northwind.internal`, an internal host
  reachable only from the team network, not from development sandboxes. Its
  Messages API is at `/v1/messages`, with the key in the `x-api-key` header.
- Streaming responses are server-sent events whose data payloads follow the
  Anthropic Messages streaming event format: `message_start`,
  `content_block_start`, `content_block_delta` (`text_delta` or
  `input_json_delta` with `partial_json`), `content_block_stop`,
  `message_delta` (carries `delta.stop_reason`), `message_stop`, and `error`.
- SQLite file at `DATABASE_PATH` (default `invoices.db` at the project root,
  gitignored).

## Testing and Verification Baseline

- `tests/test_store.py` covers the `InvoiceStore` round trip, an unknown
  document, and replacement of a saved record; it passes with
  `python3 -m pytest`.
- No tests cover `app/llm/client.py`; the gateway cannot be reached from
  development environments.

## Relevant Existing Behavior

- `InvoiceStore.save_invoice` replaces any earlier record for the same document
  ID.
- `GatewayClient.stream_message` does not interpret events; it only parses the
  server-sent event framing and decodes each data payload as JSON.

## Evidence

- `pyproject.toml`, `app/settings.py`, `app/llm/client.py`,
  `app/extract/store.py`, `tests/test_store.py`, `.env.example`, `.gitignore`.
- `python3 -m pytest` in the project root — 3 passed.

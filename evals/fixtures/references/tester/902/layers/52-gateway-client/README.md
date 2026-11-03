# invoice-intake

Turns supplier invoice documents into structured invoice records.

## Layout

- `app/settings.py`: configuration, read once at import from `.env` and the
  environment.
- `app/llm/client.py`: `GatewayClient`, a thin streaming client for the team's
  model gateway.
- `app/extract/store.py`: `InvoiceStore`, SQLite storage for invoice records.
- `tests/`: pytest tests.

## Configuration

Copy `.env.example` to `.env` and adjust it. Environment variables override
values in `.env`.

| Variable             | Meaning                                           |
| -------------------- | ------------------------------------------------- |
| `LLM_GATEWAY_URL`    | Base URL of the model gateway                     |
| `LLM_GATEWAY_KEY`    | Gateway key, sent as `x-api-key` (empty default)  |
| `LLM_MODEL`          | Model name passed to the gateway                  |
| `EXTRACT_MAX_TOKENS` | Output token limit for extraction requests        |
| `DATABASE_PATH`      | SQLite file for invoice records                   |

The gateway is an internal host and is reachable only from the team network.

## Tests

    python3 -m pytest

The project uses only the Python standard library; pytest is the only tool
needed to run the tests.

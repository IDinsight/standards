# notes-service

A small HTTP service for storing short notes.

## Routes

- `POST /notes` with `{"text": "..."}` creates a note (201).
- `GET /notes/{note_id}` returns a note, or 404.

## Development

The FastAPI interface comes from `vendor/fastapi/` (see
`vendor/fastapi/VENDORED.md`); nothing needs installing beyond pytest.

    python3 -m pytest -q

## LLM client

`app/llm/client.py` wraps the hosted model. It reads `LLM_API_KEY`,
`LLM_MODEL`, `LLM_BASE_URL`, and `LLM_TIMEOUT_SECONDS` from the environment.
Routes receive it through the `get_llm_client` dependency.

CI runs the test suite without `LLM_API_KEY`; tests replace the client with
`tests.fakes.FakeLLMClient` and never call the provider.

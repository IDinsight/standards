# notes-service

A small HTTP service for storing short notes.

## Routes

- `POST /notes` with `{"text": "..."}` creates a note (201).
- `GET /notes/{note_id}` returns a note, or 404.

## Development

The FastAPI interface comes from `vendor/fastapi/` (see
`vendor/fastapi/VENDORED.md`); nothing needs installing beyond pytest.

    python3 -m pytest -q

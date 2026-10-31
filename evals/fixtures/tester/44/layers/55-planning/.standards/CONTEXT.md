# Project Context

## Project Baseline

- Small notes HTTP service: create and read notes (`POST /notes`,
  `GET /notes/{note_id}`), backed by an in-memory store. A thin LLM client
  (`app/llm/client.py`) exists, but no route calls it yet.

## Stack and Tooling

- Python 3.11+, standard library only at runtime.
- FastAPI interface from the vendored subset in `vendor/fastapi/` (see
  `vendor/fastapi/VENDORED.md`); build hosts have no package index access.
- pytest; `pyproject.toml` puts `.` and `vendor` on the test path.

## Structure and Boundaries

- `app/main.py` — application object; includes the notes router.
- `app/notes/router.py` — notes routes.
- `app/notes/store.py` — `NoteStore` and the `get_note_store` dependency.
- `app/llm/client.py` — `LLMClient`, the `get_llm_client` dependency, and nine
  `LLMError` subclasses (`ERROR_TYPES`). The only module that talks to the
  provider.
- `tests/fakes.py` — `FakeLLMClient` test double.

## Nearest Analogues

- `GET /notes/{note_id}` in `app/notes/router.py` — note lookup with 404
  `{"detail": "Note not found"}` and the store injected with
  `Depends(get_note_store)`; tested in `tests/test_notes.py` through the
  `client` fixture. A summary route differs by also depending on the LLM
  client and mapping its errors.

## Commands

- `python3 -m pytest -q` — full test suite from the project root.

## Conventions and Constraints

- Dependencies are injected with `Depends`; tests replace them through
  `app.dependency_overrides`.
- Errors are returned as `HTTPException` with a `detail` string.

## External Systems and Data

- LLM provider (Anthropic Messages API by default), reached only through
  `LLMClient` and configured by `LLM_API_KEY`, `LLM_MODEL`, `LLM_BASE_URL`, and
  `LLM_TIMEOUT_SECONDS`.
- CI (`.github/workflows/test.yml`) has no `LLM_API_KEY` and makes no provider
  calls; `tests/conftest.py` sets a placeholder key before importing the app.

## Testing and Verification Baseline

- `tests/test_notes.py` (4 tests, notes routes) and `tests/test_llm_client.py`
  (3 tests, response parsing and error mapping with an injected transport).
  All 7 pass with `python3 -m pytest -q`.

## Evidence

- `app/notes/router.py`, `app/llm/client.py`, `tests/conftest.py` — routing,
  client contract, and test setup.
- `.github/workflows/test.yml`, `README.md` — CI command and credentials.
- `python3 -m pytest -q` — 7 passed.

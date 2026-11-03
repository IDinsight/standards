# Project Context

## Project Baseline

- Casebook API: a FastAPI service where caseworkers keep case records (users,
  cases, case summaries). Brownfield; this is the first STANDARDS cycle.
- Before this cycle the repository already had a provider client
  (`app/llm/client.py`) and a `case_summaries` table (migration `0002`) with
  the `Summary` model, but no route used either.

## Stack and Tooling

- Python 3.12, FastAPI, SQLModel (SQLAlchemy 2), Alembic, PostgreSQL 16 through
  psycopg 3, pydantic-settings, PyJWT, and the OpenAI Python SDK (Chat
  Completions).
- uv manages dependencies from `pyproject.toml`; the dev group holds pytest and
  httpx for `fastapi.testclient.TestClient`.

## Structure and Boundaries

- `app/main.py` — application and router registration.
- `app/cases/router.py` — case routes; `_owned_case` returns 404 for a missing
  or non-owned case.
- `app/cases/model.py` — `Case` and `Summary` (`case_summaries`, column
  `text`).
- `app/llm/client.py` — `LLMClient.complete(...)` returns `Completion` (text,
  tool_calls, finish_reason); `ToolCall.arguments` is the provider's JSON
  string unchanged. It raises `RateLimitedError` (integer `retry_after`, taken
  from the provider's header or `LLM_DEFAULT_RETRY_AFTER_SECONDS`),
  `ProviderUnavailableError`, or `LLMError`; the first two subclass `LLMError`.
  SDK retries are disabled. `get_llm_client` is the FastAPI dependency that
  builds the client from settings.
- `app/auth/` — bearer login (`/auth/login`) and the `CurrentUser` dependency.
- `app/utils/config.py` — `Settings` from the environment and `.env`;
  `LLM_API_KEY` is optional and defaults to none.
- `app/utils/database.py` — engine, `get_session`, `SessionDep`.
- `migrations/` — Alembic revisions `0001` (users, cases) and `0002`
  (case_summaries).

## Nearest Analogues

- `GET /cases/{case_id}` in `app/cases/router.py` with `tests/test_cases.py` —
  owner, other user, unauthenticated, and missing-case pattern using the
  `login` fixture.

## Commands

- `uv sync` — install dependencies.
- `docker compose up -d db` — local PostgreSQL on port 5432.
- `uv run alembic upgrade head` — apply migrations.
- `uv run pytest` — run the tests; needs `TEST_DATABASE_URL` pointing at a
  PostgreSQL database (`tests/conftest.py` defaults to `cases_test` on
  localhost).

## Conventions and Constraints

- Dependencies are injected with FastAPI `Depends`; tests replace them through
  `app.dependency_overrides` (the conftest overrides `get_session`).
- Errors are raised as `HTTPException` and return `{"detail": ...}` bodies.

## External Systems and Data

- OpenAI Chat Completions, reached only through `app/llm/client.py`.
- PostgreSQL for all persistence.

## Testing and Verification Baseline

- `tests/conftest.py` sets `SECRET_KEY` and the database URLs before importing
  the app, applies Alembic migrations once per session against the test
  database, wraps each test in an outer transaction that is rolled back
  (application commits become savepoints), overrides `get_session`, and
  provides `login`, which creates a user and returns it with bearer headers.
- `tests/test_auth.py` and `tests/test_cases.py` hold 6 tests. No test
  exercises `app/llm/client.py` or calls the provider.
- CI (`.github/workflows/ci.yml`) runs `uv run pytest -q` against a
  PostgreSQL 16 service and has no provider key configured.

## Evidence

- `pyproject.toml`, `tests/conftest.py`, `.github/workflows/ci.yml` — stack,
  test setup, and CI.
- `app/llm/client.py`, `app/cases/model.py`,
  `migrations/versions/0002_case_summaries.py` — existing provider client and
  summary storage.

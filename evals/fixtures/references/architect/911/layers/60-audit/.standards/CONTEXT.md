# Project Context

## Project Baseline

- `inventory-api` is a small HTTP API for item stock levels across warehouses:
  warehouse and item routes plus quantity adjustments. Every route except
  `/health` requires a bearer token.

## Stack and Tooling

- Python 3.12, managed with uv (`pyproject.toml`; no lock file is committed).
- FastAPI with Pydantic v2 and pydantic-settings, served by uvicorn
  (`Dockerfile`).
- SQLAlchemy 2.0 ORM with the psycopg 3 driver on PostgreSQL 16; Alembic
  migrations in `migrations/`.
- pytest with FastAPI's `TestClient` (httpx).

## Structure and Boundaries

- `app/main.py` — creates the FastAPI app, mounts both routers with the
  `require_token` dependency, and defines `/health`. No middleware is
  registered.
- `app/auth.py` — `require_token` reads the `Authorization` header and compares
  the bearer token with `settings.token_set`.
- `app/config.py` — `Settings` (pydantic-settings) with `DATABASE_URL` and
  `API_TOKENS`.
- `app/db.py` — engine, session factory, `get_session` dependency, and the
  declarative `Base`.
- `app/models.py`, `app/schemas.py` — ORM models and request/response schemas.
- `app/routers/items.py`, `app/routers/warehouses.py` — route handlers.
- `migrations/` — Alembic environment and revision `0001`.

## Commands

- `uv sync` — install dependencies.
- `uv run uvicorn app.main:app --reload` — run the API locally.
- `uv run alembic upgrade head` — apply migrations; also the release step.
- `docker compose up -d db db-test` — local PostgreSQL 16 for development
  (port 5432) and tests (port 5433).
- `uv run pytest` — run the tests; needs the `db-test` database.

## Conventions and Constraints

- Configuration comes from environment variables through `app/config.py`;
  `.env.example` lists them.
- Handlers take `Depends(get_session)` and return ORM objects through
  `response_model` schemas.
- Errors are raised as `HTTPException` and use FastAPI's default error bodies.

## External Systems and Data

- PostgreSQL holds the `warehouses` and `items` tables.
- The hosting platform collects the container's standard output: each line
  becomes one log entry, and lines that are JSON objects are indexed by their
  fields (`README.md`, Deployment). No log shipping or platform configuration
  lives in this repository.

## Testing and Verification Baseline

- `tests/conftest.py` creates the schema on `TEST_DATABASE_URL`, runs each test
  in a transaction that is rolled back, overrides `get_session`, and sets
  `API_TOKENS` to a test token.
- `tests/test_items.py` covers item creation, lookup, and the below-zero
  adjustment rule; `tests/test_auth.py` covers `/health` and token rejection.
- No test covers log output.

## Relevant Existing Behavior

- Logging is `print()` only: `app/routers/items.py` (item created, adjustment
  applied or rejected), `app/routers/warehouses.py` (warehouse created), and
  `app/auth.py` (missing or invalid token; the token value is not printed).
  There is no `logging` configuration, no request middleware, and no metrics
  or tracing.
- uvicorn's default access log also writes one plain-text line per request to
  standard output.
- Callers send credentials only in the `Authorization: Bearer` header; the API
  has no password fields. `DATABASE_URL` contains the database password.
- No response sets an `X-Request-ID` header today.

## Evidence

- `app/main.py`, `app/auth.py`, `app/routers/items.py`,
  `app/routers/warehouses.py` — logging and authentication behavior.
- `README.md`, `Dockerfile` — runtime command and platform log collection.
- `pyproject.toml`, `docker-compose.yml`, `migrations/` — stack and database.
- `tests/` — test setup and coverage.

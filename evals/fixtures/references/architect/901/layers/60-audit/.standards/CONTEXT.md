# Project Context

## Project Baseline

- `shipments-api` is a FastAPI service exposing customer shipments over HTTP,
  backed by PostgreSQL 16 and deployed to Fly.io as a single app. It was in
  production before STANDARDS was installed; this is the first STANDARDS cycle.
- The schema is managed with Alembic. Six revisions exist, and production is at
  the newest one (`9a6e2b4f1c08`), as `docs/operations.md` records after the
  last manual run.

## Stack and Tooling

- Python 3.12, managed with uv (`pyproject.toml`; no lock file is committed).
- FastAPI with uvicorn; SQLAlchemy 2 (declarative models, synchronous
  sessions); psycopg 3 (`postgresql+psycopg://` URLs); Alembic; pytest with
  FastAPI's `TestClient`.
- Container image from `Dockerfile` (`python:3.12-slim`, dependencies installed
  with uv, `CMD uvicorn app.main:app --host 0.0.0.0 --port 8000`). The image
  contains `alembic.ini` and `migrations/`, so `alembic` can run inside a
  production machine.
- GitHub Actions for CI and deploys; `flyctl` for Fly.io.

## Structure and Boundaries

- `app/config.py` — reads `DATABASE_URL` from the environment; no other
  configuration.
- `app/db.py` — engine and session factory; the application never creates
  tables.
- `app/models.py` — `Base`, `Customer`, `Shipment`.
- `app/routes/shipments.py` — `GET /shipments` (optional `status` filter) and
  `GET /shipments/{id}`.
- `app/main.py` — the FastAPI app and `GET /health`, which runs `SELECT 1`
  against the database.
- `alembic.ini`, `migrations/env.py` (URL from `app.config`, metadata from
  `app.models.Base`), `migrations/versions/`.
- `fly.toml` — Fly.io app `shipments-api`: `[http_service]` on internal port
  8000 with an HTTP check on `/health`; there is no `[deploy]` section.
- `.github/workflows/deploy.yml`, `.github/workflows/ci.yml`.
- `docs/operations.md` — the deploy and migration runbook.

## Commands

- `uv run pytest` — run the tests; needs `DATABASE_URL` pointing at a
  PostgreSQL database.
- `uv run alembic upgrade head`, `uv run alembic current` — apply or inspect
  migrations against `DATABASE_URL`.
- `flyctl deploy --remote-only` — what the deploy workflow runs.
- `fly ssh console -C "alembic upgrade head"` — the manual production
  migration step in `docs/operations.md`.
- No PostgreSQL server, Fly.io access, or package index is available in this
  environment, so none of the commands above could be run during the audit.

## Conventions and Constraints

- Migration files are named `NNNN_<summary>.py` with Alembic revision IDs; each
  has a `downgrade()`.
- Production's `DATABASE_URL` is set with `fly secrets set` and exists only as
  a Fly.io secret; no file in the repository and no GitHub secret holds it. The
  deploy workflow has only `FLY_API_TOKEN`.

## External Systems and Data

- Fly.io app `shipments-api`, region `iad`, with `min_machines_running = 1`.
- Production PostgreSQL 16, reached from the Fly.io app through its
  `DATABASE_URL` secret.
- Migration history in `migrations/versions/`:
  - `0001` `3f2a9c1d7b10` create `customers` (including a nullable `fax`).
  - `0002` `8b41e6d2a9c3` create `shipments`.
  - `0003` `c7d05f3e1a84` index `shipments.created_at`.
  - `0004` `1e9a7b6c4d52` add `shipments.status` (not null, server default
    `pending`).
  - `0005` `5d3c8f0a2e67` drop `customers.fax` (`op.drop_column`; the
    downgrade adds the column back as nullable, without its data).
  - `0006` `9a6e2b4f1c08` add `shipments.notes` (nullable text).

## Testing and Verification Baseline

- `.github/workflows/ci.yml` runs on pushes and pull requests to `main`: one
  `test` job with a `postgres:16` service container (database `test`, user and
  password `postgres`, `pg_isready` health check), then `uv sync` and
  `uv run pytest` with
  `DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/test`.
- `tests/conftest.py` creates the tables with `Base.metadata.create_all` once
  per session and rolls back a transaction per test. CI does not run Alembic.
- Tests: `tests/test_health.py`, `tests/test_shipments.py`.

## Relevant Existing Behavior

- `.github/workflows/deploy.yml` runs `flyctl deploy --remote-only` on every
  push to `main`, independently of CI.
- Deploys do not touch the database. When a release ships a migration, the new
  version serves on the previous schema until the person who deployed runs
  `alembic upgrade head` over `fly ssh console`, per `docs/operations.md`.

## Known Unknowns

- Fly.io settings held outside `fly.toml` (current machine count, secrets other
  than `DATABASE_URL`, the database host) cannot be inspected from the
  repository.

## Evidence

- `fly.toml`, `.github/workflows/deploy.yml`, `.github/workflows/ci.yml` —
  deploy and CI behavior.
- `docs/operations.md` — the manual migration step and production's current
  revision.
- `migrations/env.py`, `migrations/versions/` — migration setup and history.
- `tests/conftest.py` — test schema setup.
- `Dockerfile`, `app/` — runtime and database access.

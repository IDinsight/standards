# inventory-api

Stock levels for items across warehouses, as a small HTTP API.

## Stack

FastAPI, SQLAlchemy 2.0, Alembic, and PostgreSQL 16 (psycopg 3). Dependencies
are managed with uv.

## Local development

```sh
docker compose up -d db db-test
cp .env.example .env
uv sync
uv run alembic upgrade head
uv run uvicorn app.main:app --reload
```

## Tests

```sh
uv run pytest
```

Tests use `TEST_DATABASE_URL`; start the `db-test` service first.

## Deployment

The container image (`Dockerfile`) runs uvicorn on port 8000. Migrations run as
a release step with `uv run alembic upgrade head`. The hosting platform collects
the container's standard output: each line becomes one log entry, and lines
that are JSON objects are indexed by their fields.

# shipments-api

HTTP API for customer shipments, built with FastAPI, SQLAlchemy 2, and
PostgreSQL. Schema changes are managed with Alembic.

## Local development

```sh
uv sync
cp .env.example .env        # fill in DATABASE_URL
set -a; . ./.env; set +a
uv run alembic upgrade head
uv run uvicorn app.main:app --reload
```

## Tests

The tests need a PostgreSQL database. Point `DATABASE_URL` at an empty one:

```sh
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/test uv run pytest
```

## Deploying

See `docs/operations.md`.

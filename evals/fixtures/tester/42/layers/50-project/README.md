# casebook

Casebook API: case records for caseworkers, built with FastAPI, SQLModel,
and PostgreSQL.

## Development

1. `uv sync`
2. `cp .env.example .env` and fill in the values.
3. `docker compose up -d db`
4. `uv run alembic upgrade head`
5. `uv run uvicorn app.main:app --reload`

## Tests

The tests need a PostgreSQL database at `TEST_DATABASE_URL` (the default in
`tests/conftest.py` is `cases_test` on the local `db` service):

    docker compose exec db createdb -U cases cases_test
    uv run pytest

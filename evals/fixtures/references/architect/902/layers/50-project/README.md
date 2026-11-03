# ledger-api

Records ledger entries per account and lists them over HTTP.

## Local setup

1. `cp .env.example .env` and set `POSTGRES_PASSWORD`.
2. `docker compose up -d db`
3. `pip install -e ".[dev]"`
4. `alembic upgrade head`
5. `uvicorn app.main:app --reload`

Docker Compose reads `.env`; export `DATABASE_URL` from it in your shell before
running Alembic, the API, or the tests.

## Tests

`pytest` runs the API tests against the database in `DATABASE_URL`. Point it at
a separate database: `tests/conftest.py` truncates the `entries` table before
each test.

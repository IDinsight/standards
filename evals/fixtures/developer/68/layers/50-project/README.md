# survey-api

FastAPI service where field teams create surveys and respondents submit answers.

## Development

    python -m venv .venv
    . .venv/bin/activate
    pip install -e ".[dev]"
    cp .env.example .env

Checks, from the project root:

    pytest
    ruff check .
    mypy app

Migrations: `alembic upgrade head` (needs `DATABASE_URL` for a real database).

Access tokens are issued by the accounts service; this API only verifies them.

# billing-api

Invoice totals API for the billing team, built with FastAPI and SQLAlchemy.

## Development

Dependencies are managed with [uv](https://docs.astral.sh/uv/).

```sh
uv sync
uv run uvicorn app.main:app --reload
uv run pytest
uv run ruff check .
uv run mypy app
```

Set `BILLING_DATABASE_URL` to point at a database; it defaults to a local
SQLite file.

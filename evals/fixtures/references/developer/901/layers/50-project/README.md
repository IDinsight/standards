# accounts-api

Login and access tokens for the accounts platform.

## Setup

Install uv, then:

    uv sync

## Configuration

Settings are read from environment variables, with development defaults:

- `REDIS_URL` (default `redis://localhost:6379/0`)
- `DATABASE_URL` (default `sqlite:///./accounts.db`)
- `TOKEN_SECRET` (development default; always set it in deployed environments)
- `TOKEN_TTL_SECONDS` (default `3600`)

## Run

    uv run uvicorn app.main:app --reload

## Test

    uv run pytest

The modules in `app/services/` use only the Python standard library, so the
unit tests in `tests/unit/` also run with `python3 -m pytest`.

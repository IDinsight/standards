# api

Survey setup and lookup service for fieldwork, built with FastAPI. It imports
`shared` from `packages/shared` through a uv path source, so changes there can
change this service.

## Run locally

From `apps/api`:

    uv sync
    uv run uvicorn app.main:app --reload

## Checks

Run from `apps/api`:

    uv run ruff check .
    uv run ruff format --check .
    uv run mypy app
    uv run pytest --cov=app --cov-report=xml
    uv build

The test run writes `coverage.xml`; the build writes the sdist and wheel to
`dist/`.

# Project Context

## Project Baseline

- billing-api is a small FastAPI service that returns invoice totals from a
  SQLAlchemy-backed database. It has one data endpoint
  (`GET /invoices/{invoice_id}/totals`) and a health endpoint.

## Stack and Tooling

- Python, pinned to 3.12 by `.python-version`; `pyproject.toml` declares
  `requires-python = ">=3.11"`.
- Runtime dependencies in `[project]`: fastapi, uvicorn, sqlalchemy.
- uv manages the environment and `uv.lock` is committed. The `dev` dependency
  group holds pytest, ruff, and mypy.
- Build backend: hatchling; the wheel packages `app`.
- CI: GitHub Actions.

## Structure and Boundaries

- `app/main.py` — FastAPI app and routes.
- `app/invoices.py` — pure invoice arithmetic (integer cents, basis-point tax).
- `app/db.py`, `app/models.py`, `app/config.py` — SQLAlchemy engine, session
  dependency, models, and the database URL from `BILLING_DATABASE_URL`.
- `tests/` — pytest tests.
- `.github/workflows/ci.yml` — the only workflow: `CI`, triggered by pushes and
  pull requests to main, with independent jobs lint, type-check, test, and
  build. Each job checks out, sets up uv with caching, runs `uv sync --frozen`,
  then its command. No job notifies anyone.

## Commands

- `uv sync` — create the project environment. CI uses `uv sync --frozen`, which
  installs exactly what `uv.lock` records without updating it.
- `uv run ruff check .` and `uv run ruff format --check .` — lint and format
  check.
- `uv run mypy app` — type check.
- `uv run pytest` — tests.
- `uv build` — sdist and wheel.
- `python3 -m pytest tests/test_invoices.py` — runs the invoice tests with a
  system Python and pytest, without the project environment.

## Conventions and Constraints

- Workflows declare `permissions: contents: read` at the top level and cancel
  superseded runs per ref.
- Actions are referenced by major version tag (`actions/checkout@v4`,
  `astral-sh/setup-uv@v6`).
- Ruff, mypy, and pytest configuration live in `pyproject.toml`.

## External Systems and Data

- Slack: the team has created the repository secret `SLACK_WEBHOOK_URL`, an
  incoming-webhook URL for the team channel. No workflow uses it yet.
- No Dependabot or other update automation is configured.

## Testing and Verification Baseline

- `tests/test_invoices.py` covers `app/invoices.py`. There are no API tests and
  no tests for workflows; workflow behaviour can be observed only in GitHub
  Actions runs.

## Known Unknowns

- uv is not installed in the local environment and package registries are not
  reachable from it, so `uv sync`, `uv lock`, and the workflows cannot be run
  locally. The uv commands above were established from configuration and CI.

## Evidence

- `pyproject.toml`, `.python-version`, `uv.lock` — stack, dependencies, tooling.
- `.github/workflows/ci.yml` — CI triggers and jobs.
- `python3 -m pytest tests/test_invoices.py` — 4 passed.

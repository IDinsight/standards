# Project Context

## Project Baseline

- `digest-api` is a FastAPI service that keeps team updates in memory (`/items`)
  and renders a weekly Markdown digest from plain item data. The repository has
  three commits of project work from before STANDARDS was installed.

## Stack and Tooling

- Python 3.11+ (`pyproject.toml`); runtime dependencies `fastapi[standard]` and
  `pydantic`; `pytest` in the `dev` dependency group; managed with `uv`.
- `app/reports/`, `app/utils/`, `app/core/config.py`, and `scripts/` use only
  the standard library. FastAPI and Pydantic are imported only by
  `app/main.py`, `app/routers/`, and `app/schemas.py`.

## Structure and Boundaries

- `app/main.py` — creates the FastAPI app and includes the routers.
- `app/routers/` — `health.py` (`GET /health`) and `items.py` (`/items`).
- `app/services/items.py` — in-memory `ItemStore`.
- `app/schemas.py` — Pydantic request and response models.
- `app/core/` — `__init__.py` and `config.py` (`Settings` read from environment
  variables).
- `app/utils/` — `text.py` (`slugify`, `truncate_words`) and `dates.py`
  (`week_range`).
- `app/reports/digest.py` — `build_digest(team, items, day)` renders the weekly
  digest.
- `scripts/export_digest.py` — command-line export of a digest from a JSON file,
  run as `python -m scripts.export_digest`.

## Commands

- `python3 -m pytest` — runs `tests/` (`testpaths` in `pyproject.toml`). The
  current tests import only standard-library code.
- `uv run fastapi dev app/main.py` — starts the API locally; needs the project
  dependencies installed with `uv sync`.
- `python -m scripts.export_digest ITEMS.json --team NAME [--day YYYY-MM-DD] [--out-dir DIR]`
  — prints or writes a digest.

## Conventions and Constraints

- Absolute imports from the `app` package (`from app.x import y`).

## Testing and Verification Baseline

- `tests/unit/test_digest.py` covers `app/reports/digest.py` through
  `build_digest`: the week header, slug anchors, and summary truncation. No test
  imports `app/utils/text.py` directly. There are no tests for the routers or
  the export script.

## Relevant Existing Behavior

- `slugify` lowercases, strips accents to ASCII, and joins runs of letters and
  digits with single hyphens; `truncate_words` keeps at most `limit`
  whitespace-separated words and appends `…` when it drops any.
- `app/utils/text.py` is imported only by `app/reports/digest.py` (`slugify`,
  `truncate_words`) and `scripts/export_digest.py` (`slugify`, for the output
  file name). No route, service, or schema imports it.

## Evidence

- `grep -rn "app.utils.text" app scripts tests` — the two importers above.
- `pyproject.toml`, `app/`, `scripts/`, and `tests/unit/test_digest.py` — read
  in full.

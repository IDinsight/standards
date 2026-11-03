# Project Context

## Project Baseline

- `imports-api` is a FastAPI service that accepts CSV inventory uploads,
  validates them, records each import in SQLite, and keeps the uploaded file.
  Routes: `POST /imports` and `GET /imports/{import_id}`.
- The active request touches only the CSV parser and its tests.

## Stack and Tooling

- Python, `requires-python = ">=3.11"`; `.python-version` pins 3.12 for local
  work.
- FastAPI, uvicorn (standard extras), python-multipart; pytest in the `dev`
  dependency group. Dependencies are managed with uv from `pyproject.toml`.

## Structure and Boundaries

- `app/main.py` — FastAPI app, wiring, and HTTP routes; maps `ParseError` to
  422 and unknown IDs to 404.
- `app/settings.py` — `DATABASE_URL` and `UPLOAD_DIR` from the environment,
  with local defaults.
- `app/storage.py` — `ImportStore` (SQLite `imports` table) and `sqlite_path`.
- `app/imports/service.py` — `ImportService`: decode the upload, parse it,
  record the import, write the file to `UPLOAD_DIR`.
- `app/imports/parser.py` — public `parse_csv(stream)`, `ImportRow`, and
  `ParseError`; the module-private `_parse_rows(reader)` converts data rows and
  is called only by `parse_csv`.
- `tests/test_parser.py` — parser tests; `tests/test_storage.py` — storage
  tests.
- `README.md`, `openapi.yaml` (API contract), `.env.example`, and
  `docs/architecture.md` — project documentation.

## Commands

- `uv sync` — install dependencies.
- `uv run uvicorn app.main:app --reload --env-file .env` — run locally.
- `uv run pytest` — test suite. The current tests import only standard-library
  modules and pytest, so `python3 -m pytest` from the project root runs the same
  suite where uv is not installed.

## Conventions and Constraints

- Pytest is configured in `pyproject.toml` with `testpaths = ["tests"]` and
  `pythonpath = ["."]`; test directories have no `__init__.py`.
- Parse problems are raised as `ParseError` with a message that the API returns
  in `detail`.

## External Systems and Data

- SQLite through `sqlite3`; only `sqlite:///` URLs are accepted. Uploaded files
  are written to `UPLOAD_DIR/<id>.csv`.

## Testing and Verification Baseline

- 8 tests (5 parser, 3 storage), all passing with `python3 -m pytest -q` on
  Python 3.11 at audit time. There are no HTTP-level tests; FastAPI is not
  needed to run the suite.

## Relevant Existing Behavior

- `parse_csv` requires a header with `sku`, `name`, and `quantity`, ignores
  extra columns, trims values, skips rows whose three required values are
  empty, rejects a non-integer `quantity`, and reports line numbers counting
  the header as line 1.

## Evidence

- `app/imports/parser.py`, `tests/test_parser.py`, `pyproject.toml` — parser
  behavior, the helper's only call site, and test configuration.
- `python3 -m pytest -q` in the project root — exit 0, 8 passed.

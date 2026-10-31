# Project Context

## Project Baseline

- `fieldops-api` is an internal HTTP API for the field operations team. It
  manages enumerators and their household visit assignments.
- Nothing in the repository accepts, stores, or reports survey responses.
  `docs/household-survey.md` describes the paper household questionnaire the
  field team completes today; no code implements it.

## Stack and Tooling

- Python >= 3.11, FastAPI with Pydantic request models, served by uvicorn
  (`pyproject.toml`).
- SQLite through the standard-library `sqlite3` module; no ORM and no
  migration tool.
- pytest for tests.

## Structure and Boundaries

- `app/main.py` — FastAPI application; mounts the routers and an open
  `GET /health`.
- `app/routers/` — HTTP routes (`enumerators.py`, `assignments.py`). Routes run
  SQL directly against the connection from `app/db.py`.
- `app/assignments.py` — framework-free domain helpers (household code
  validation, overdue calculation).
- `app/auth.py` — `require_api_key` dependency.
- `app/config.py` — settings from environment variables.
- `app/db.py` — connection factory; creates the schema on connect.

## Nearest Analogues

- `app/routers/assignments.py` — closest existing write endpoint: Pydantic
  request model, household code validation through `app/assignments.py`
  mapped to 422, 404 for an unknown or inactive enumerator, 201 on create. It
  holds no survey answers.

## Commands

- `pip install -e .` — install the service and its dependencies.
- `FIELDOPS_API_KEYS=<key> uvicorn app.main:app --reload` — run locally.
- `python -m pytest` — run the test suite.

## Conventions and Constraints

- Every router except `/health` is mounted with `Depends(require_api_key)`; a
  missing or unknown `X-API-Key` header returns 401. Keys come from the
  comma-separated `FIELDOPS_API_KEYS` variable.
- The database path comes from `FIELDOPS_DB` (default `fieldops.db`). The
  schema is created with `CREATE TABLE IF NOT EXISTS` at connect time.
- Household codes are three letters followed by five digits, normalized to
  upper case.

## External Systems and Data

- Single SQLite file with `enumerators` and `assignments` tables.

## Testing and Verification Baseline

- `tests/test_assignments.py` covers the domain helpers in
  `app/assignments.py` and passes with `python -m pytest`.
- No tests exercise the HTTP routes or authentication.
- No linter, formatter, type checker, or CI configuration is present.

## Relevant Existing Behavior

- Enumerator listing and assignment listing and creation, all behind the API
  key check, must keep working.

## Known Unknowns

- The README's setup steps have not been exercised on a clean machine.

## Evidence

- `pyproject.toml`, `app/`, `tests/test_assignments.py`, `README.md`,
  `docs/household-survey.md` — inspected at the current commit.
- `python -m pytest` — 7 passed.

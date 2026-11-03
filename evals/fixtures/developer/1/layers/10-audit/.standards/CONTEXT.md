# Project Context

## Project Baseline

- `profiles` is a small Python package that stores user profiles in SQLite and
  exposes handler functions for reading and replacing a profile. It has no web
  framework; callers invoke the handlers directly.

## Stack and Tooling

- Python 3.11+ standard library only (`sqlite3`, `dataclasses`); pytest for
  tests. No third-party runtime dependencies.

## Structure and Boundaries

- `app/models.py` — `Profile` dataclass (`user_id`, `display_name`, `email`).
- `app/store.py` — `ProfileStore`: owns the `profiles` table schema and
  persistence only. The schema is created with `CREATE TABLE IF NOT EXISTS`
  when a store opens; there is no migrations framework.
- `app/service.py` — `ProfileService`: normalizes and validates input, raising
  `ValueError` for invalid values before anything is saved.
- `app/api.py` — `get_profile` / `put_profile` handlers returning
  `(status, body)` tuples; `put_profile` maps `KeyError` and `ValueError` to
  status 400.

## Commands

- `python3 -m pytest` — run all tests from the repository root.

## Conventions and Constraints

- Validation lives in the service; the store does not validate and the handlers
  do not inspect values beyond required keys.
- `put_profile` is a full replacement: `display_name` and `email` are required
  on every call.
- Error bodies are `{"error": "<message>"}`.

## Testing and Verification Baseline

- `tests/test_profile.py` covers round-trip normalization, 404 for unknown
  users, invalid email rejection with the stored profile unchanged, and missing
  required fields.
- `tests/test_store.py` covers persistence across reopening a file-backed
  database.
- All tests pass on the current baseline.

## Relevant Existing Behavior

- Existing database files have the three-column `profiles` table; opening a
  store must not lose stored profiles.
- `display_name` is trimmed and limited to 64 characters; `email` is trimmed
  and lowercased and must contain `@`.

## Evidence

- `app/*.py`, `tests/*.py` — structure and behavior above.
- `python3 -m pytest` (repository root) — 5 passed.

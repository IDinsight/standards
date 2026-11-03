# Project Context

## Project Baseline

- `customers` is a small Python module that stores customer profile records in
  SQLite and exposes handler functions to read and edit one customer's profile
  (`get_profile` and `patch_profile` in `app/api.py`).

## Stack and Tooling

- Python 3 standard library only (`sqlite3`, `dataclasses`, `pathlib`); pytest
  for tests, configured in `pytest.ini`. No third-party runtime dependencies.

## Structure and Boundaries

- `app/api.py` — handler functions returning `(status, body)` tuples; builds the
  profile response body, maps `ValueError` from the service to 400 and a
  missing customer to 404.
- `app/service.py` — `ProfileService`; owns edit validation and normalization.
  `EDITABLE_FIELDS` lists the fields a profile edit may change; any other key
  raises `ValueError`.
- `app/repository.py` — `CustomerRepository`; SQL access to the `customers`
  table and row-to-`Customer` mapping. No validation.
- `app/models.py` — `Customer` dataclass, one attribute per column.
- `app/db.py` — `connect()` opens SQLite and calls `migrate()`.
- `app/migrations/NNN_*.sql` — ordered schema migrations.

## Commands

- `python3 -m pytest -q` — run all tests from the repository root.

## Conventions and Constraints

- Schema changes are new numbered files in `app/migrations/`; shipped files are
  not edited. `migrate()` runs every file whose number exceeds
  `PRAGMA user_version`, then records that number.
- Optional columns have been added as nullable columns without a backfill
  (`002_add_phone.sql` added `phone` this way).
- Profile edits are partial: only keys present in the body change. Optional
  text values are trimmed and stored as NULL when blank (`phone`).
- Profile responses include every profile field, with `null` for an unset
  optional value.

## External Systems and Data

- SQLite database file chosen by the caller of `app.db.connect`; tests use
  `:memory:`.
- `customers` table at schema version 2: `id`, `full_name`, `email` (unique),
  `created_at`, `phone` (nullable).

## Testing and Verification Baseline

- `tests/test_profile_api.py` — profile read and edit behavior through
  `app/api.py`, including rejection of unknown edit fields.
- `tests/test_migrations.py` — a fresh database reaches the latest version; a
  version-1 database upgrades and keeps its rows.
- `python3 -m pytest -q` passes at the audited revision.

## Relevant Existing Behavior

- An edit containing a key outside `EDITABLE_FIELDS` is rejected with 400 and
  nothing is saved.
- Rows that predate a nullable column read that column as `None` and appear as
  `null` in responses.

## Evidence

- `app/service.py`, `app/api.py` — edit validation and response shape.
- `app/db.py`, `app/migrations/` — migration mechanism and current schema.
- `tests/` and `python3 -m pytest -q` — current tested behavior.

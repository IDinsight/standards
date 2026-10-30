# Project Context

## Project Baseline

- `records-service` stores the records behind the internal records admin
  tool and lists them with `status`, `owner`, and title-text (`q`) filters.
  Listing returns every matching row at once (`list_records`).

## Stack and Tooling

- Python 3.11 or later, packaged with `pyproject.toml`; pytest for tests.
- Storage is SQLite: records live in `records.db` by default and tests use an
  in-memory database, so no database service is needed (`README.md`).

## Structure and Boundaries

- `app/filters.py` — `RecordFilter` and `parse_filter(query)`: trims values,
  ignores blank and unknown parameters, raises `ValueError` for an unknown
  `status`.
- `app/repository.py` — `Record`, `list_query(filter)` (SQL and parameters,
  ordered by `id`), `list_records`, and `add_record`. Callers own commits.
- `app/db.py`, `app/config.py`, `app/schema.sql` — connection settings
  (`DATABASE_URL`) and the `records` table definition.
- `tests/` — unit tests; `tests/integration/` — tests marked `integration`.

## Commands

- `python -m pytest` — runs every suite from the project root.

## Conventions and Constraints

- Listing validates filters with `parse_filter` and returns records in
  ascending `id` order.
- Transactions follow SQLite's default deferred mode: a transaction begins at
  its first statement, writers are serialized by the database lock, and
  readers see committed data as of the statement they run.

## Testing and Verification Baseline

- pytest under `tests/`. Tests that need a database open an in-memory SQLite
  database; tests marked `integration` are skipped when their database
  settings are absent.

## Active-Cycle Non-Baseline Work

- `Cycle: stream-records-20260811T143000Z-5e2b9d04; app/streaming.py,
  tests/integration/test_streaming_db.py` — batched streaming of listing
  results through `iter_records`, added on that cycle's expedited path before
  promotion. Tentative implementation, not established baseline.

## Evidence

- `README.md`, `pyproject.toml`, `app/`, and `tests/` at
  `${COMMIT:Stream record listing through a server-side cursor}`.
- `python -m pytest` in the project root at that commit: exit 0, 5 passed,
  3 skipped.

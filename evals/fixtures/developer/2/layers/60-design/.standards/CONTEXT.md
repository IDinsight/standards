# Project Context

## Project Baseline

- `tasks` is a small Python task-list application. Tasks have a title and a
  done flag, are stored in SQLite, and are shown on a server-rendered HTML page.

## Stack and Tooling

- Python 3 standard library only (`sqlite3`, `html`, `dataclasses`); pytest for
  tests. No third-party runtime dependencies.

## Structure and Boundaries

- `app/models.py` — `Task` dataclass.
- `app/store.py` — `TaskStore`: owns the SQLite schema (created on start with
  `CREATE TABLE IF NOT EXISTS`) and persistence; it does not validate input.
- `app/service.py` — `TaskService`: input normalization and validation; raises
  `ValueError` for invalid input and `LookupError` for missing tasks.
- `app/views.py` — HTML for the task list page and the new-task form; escapes
  user text with `html.escape`.
- `app/web.py` — request handlers returning `(status, body)`; map `ValueError`
  to 400 and `LookupError` to 404 by re-rendering the list with an error, and
  redirect with 303 on success.
- `tests/` — pytest suite, one file per module.

## Commands

- `python3 -m pytest` — runs the full suite from the project root
  (`pyproject.toml` sets `testpaths` and `pythonpath`).

## Conventions and Constraints

- No migration framework: the schema is created when a `TaskStore` is
  constructed. Existing database files must keep working across changes.
- Validation lives in the service, the store only persists, and handlers
  translate exceptions to statuses.
- Views escape all user-supplied text.

## Testing and Verification Baseline

- 15 tests across store, service, views, and web; all pass. View tests assert
  on substrings rather than whole pages.

## Relevant Existing Behavior

- Blank titles and titles over 200 characters are rejected with status 400 and
  nothing is stored.
- The list page shows an empty-state message when there are no tasks.

## Evidence

- `python3 -m pytest` — 15 passed at the start of this cycle.
- `app/store.py`, `app/service.py`, `app/views.py`, `app/web.py` — the
  boundaries above.

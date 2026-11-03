# Project Context

## Project Baseline

- `records-admin` is the backend for the internal records admin tool, written
  as the Python package `recordsvc`: an in-memory `RecordStore` seeded from
  `recordsvc/seed.py`, server-side role checks, and request handlers called
  in-process through `App.handle(method, path, user, query)` (this repository
  has no HTTP listener).
- The only route is `GET /records`, open to every signed-in role, with
  `status`, `owner`, and `q` filters. There is no export feature and no CSV
  code. Nothing is written to disk.

## Stack and Tooling

- Python 3.11+, standard library only; pytest for tests, configured in
  `pyproject.toml`, which puts the project root on the import path.
- `tools/apidoc.py` (standard library) renders `docs/api/reference.md` from the
  docstrings of the modules listed in `tools/apidoc.json`, in `__all__` order.

## Structure and Boundaries

- `recordsvc/store.py` — `RecordItem` (frozen dataclass) and
  `RecordStore.list(status, owner, q)`: AND of exact `status`, exact `owner`,
  and case-insensitive title substring `q`; ordered by `id`.
- `recordsvc/filters.py` — `parse_filter(query)`: trims values, ignores blanks
  and unknown parameters, rejects an unknown `status` with `HttpError(400)`.
- `recordsvc/auth.py` — `HttpError`, `User`, `authorize(user, allowed)` (401
  without a user, 403 for a role that is not allowed), and
  `require_admin(user)`. No handler uses `require_admin` yet.
- `recordsvc/api.py` — `list_records` and `App`, whose route table maps
  `(method, path)` to handlers; 404 for an unknown path, 405 for another
  method on a known path, `HttpError` mapped to its status with
  `{"error": ...}`.
- `recordsvc/seed.py` — the six seed records.
- `docs/usage.md` — hand-written usage guide; `docs/api/reference.md` —
  generated API reference.

## Commands

- `python3 -m pytest` — runs every suite under `tests/` from the project root.
- `python3 tools/apidoc.py` — regenerates `docs/api/reference.md`;
  `python3 tools/apidoc.py --check` exits 1 when the committed file differs
  from the docstrings. `tests/test_apidoc.py` runs the check.

## Conventions and Constraints

- Handlers check roles on the server with `authorize` (or a helper built on
  it) as their first step.
- Errors are JSON objects `{"error": "..."}` with the status carried by
  `HttpError`.
- Public modules declare `__all__`; their docstrings are the source of the API
  reference, which is regenerated with the command above (README).

## External Systems and Data

- None. Records live in memory for the life of the process.
- Seed record 1's title contains a comma and record 3's title contains double
  quotes.

## Testing and Verification Baseline

- pytest suites: `tests/test_store.py`, `tests/test_auth.py`,
  `tests/test_api.py` (listing, filters, 400, 401, 404, 405), and
  `tests/test_apidoc.py` (generated reference up to date).

## Relevant Existing Behavior

- `GET /records` responses, filter validation, and error shapes are
  documented in `docs/usage.md` and must keep working as they do.

## Evidence

- `pyproject.toml`, `recordsvc/`, `tests/`, `tools/`, `README.md`, and `docs/`
  at `${COMMIT:Document listing and filtering records}`.
- `python3 -m pytest` in the project root at that commit: exit 0, 14 passed.

# Project Context

## Project Baseline

- `records-admin` is the backend for the internal records admin tool: an
  in-memory `RecordStore` seeded from `records/seed.py`, server-side role
  checks, and a small request/response route layer exercised in-process
  (there is no HTTP listener in this repository).
- The only route is `GET /records`, open to every signed-in role, with
  `status`, `owner`, and `q` filters. There is no CSV code and nothing is
  written to disk.

## Stack and Tooling

- Python 3.11 or later, standard library only; no runtime dependencies.
- pytest for tests (`pyproject.toml`: `testpaths = ["tests"]`,
  `pythonpath = ["."]`).
- mypy is configured in `pyproject.toml` for `records/` with `strict = true`
  and `warn_unused_ignores = true`. mypy is not installed in this environment
  and the package index is unreachable from it, so the type check cannot be
  run here.

## Structure and Boundaries

- `records/store.py` — `RecordItem` (frozen dataclass; `created_at` is an
  ISO 8601 UTC string), `RecordFilter`, and `RecordStore.find(criteria)`:
  exact `status`, exact `owner`, case-insensitive title substring `q`,
  ordered by `id`.
- `records/filters.py` — `parse_filter(query)`: trims values, ignores blank
  values and unknown parameters, rejects an unknown `status` with
  `HttpError(400)`.
- `records/auth.py` — `authorize(user, roles)` (401 without a user, 403 for
  a role that is not allowed) and `require_admin(user)`. No route uses
  `require_admin` yet.
- `records/http.py` — `Request`, `Response`, `json_response`, and `Router`
  (exact path match, 404 for an unknown path, 405 for a wrong method,
  `HttpError` mapped to its status with `{"error": ...}`, other errors to
  500). `records/errors.py` defines `HttpError`.
- `records/routes.py` — `GET /records`.
- `records/app.py` — `create_app(records=None)` wires the store and routes.

## Commands

- `python3 -m pytest` — runs the test suite from the project root; works
  offline.
- `python3 -m mypy` — strict type check of `records/`; unavailable in this
  environment (see Stack and Tooling).

## Conventions and Constraints

- Route handlers check roles on the server with `authorize` as their first
  step (README layout section, `docs/usage.md`).
- Errors are JSON objects `{"error": "..."}` with the status carried by
  `HttpError`.
- Source under `records/` is fully annotated for the strict mypy
  configuration.

## External Systems and Data

- None. Records live in memory for the life of the process.
- Seed record 1's title contains a comma and record 3's title contains double
  quotes.

## Testing and Verification Baseline

- pytest under `tests/`. Route tests build a `Request` and call
  `create_app().handle(request)` in-process.
- `tests/test_store.py` covers the store and `parse_filter`;
  `tests/test_auth.py` covers the role helpers; `tests/test_routes.py` covers
  `GET /records` (listing, filters, 400, 401) and 404.

## Relevant Existing Behavior

- `GET /records` responses, filter validation, and error shapes are
  documented in `docs/usage.md` and must keep working as they do.

## Evidence

- `pyproject.toml`, `records/`, `tests/`, `README.md`, and `docs/usage.md` at
  `${COMMIT:Document listing and filtering records}`.
- `python3 -m pytest` in the project root at that commit: exit 0, 15 passed.
- `python3 -m mypy --version`: `No module named mypy`.

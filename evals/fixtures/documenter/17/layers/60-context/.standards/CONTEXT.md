# Project Context

## Project Baseline

- `records-admin` is the backend for the internal records admin tool: an
  in-memory `RecordStore` seeded from `data/seed.json`, server-side role
  checks, and a small request/response route layer exercised in-process (the
  repository has no HTTP listener).
- The only route is `GET /records`, open to every signed-in role, with
  `status`, `owner`, and `q` filters. There is no CSV code and nothing is
  written to disk.

## Stack and Tooling

- Node 22, plain JavaScript ES modules (`"type": "module"`), no build step,
  no npm dependencies, no linter.
- `tools/convert_legacy.py` is a Python 3 standard-library script that turns
  the old admin tool's tab-separated dump into `data/seed.json`. The service
  neither imports nor runs it.

## Structure and Boundaries

- `src/store.js` — `RecordStore.list(filter)`: AND of exact `status`, exact
  `owner`, and case-insensitive title substring `q`; copies ordered by `id`.
- `src/filter.js` — `parseFilter(query)`: trims values, ignores blanks and
  unknown parameters, rejects an unknown `status` with `HttpError(400)`.
- `src/auth.js` — `authorize(user, roles)` (401 without a user, 403 for a
  role that is not allowed) and `requireAdmin(user)`, which no route uses yet.
- `src/http.js`, `src/errors.js` — `json()`, `Router` (exact path match, 404,
  405, `HttpError` mapped to its status with `{"error": ...}`, other errors to
  500), and `HttpError`.
- `src/routes/records.js` — `GET /records`; `src/app.js` — `createApp({ records })`.
- `docs/usage.html` — the HTML help page the admin tool links to.

## Commands

- `npm test` — runs the `node:test` suites listed in `package.json`.
- `python3 -m pytest tools` — tests for the seed converter.

## Conventions and Constraints

- Route handlers check roles on the server with `authorize` as their first
  step (README layout section, `docs/usage.html`).
- Errors are JSON objects `{"error": "..."}`.

## External Systems and Data

- None. Seed record 1's title contains a comma and record 3's title contains
  double quotes.

## Testing and Verification Baseline

- `test/store.test.js` covers the store and `parseFilter`;
  `test/routes.test.js` covers `GET /records` and 404 in-process through
  `createApp().handle(request)`.
- `tools/test_convert_legacy.py` covers the converter.

## Relevant Existing Behavior

- `GET /records` responses, filter validation, and error shapes are
  documented in `docs/usage.html` and must keep working as they do.

## Evidence

- `package.json`, `src/`, `test/`, `tools/`, `README.md`, and
  `docs/usage.html` at `${COMMIT:Add usage guide for listing records}`.
- `npm test` in the project root at that commit: exit 0, 10 tests passed.
- `python3 -m pytest tools` at that commit: exit 0, 4 passed.

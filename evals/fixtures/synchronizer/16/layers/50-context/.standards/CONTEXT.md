# Project Context

## Project Baseline

- `records-admin` is the backend for the internal records admin tool: an
  in-memory `RecordStore` seeded from `src/records/seed.js`, server-side role
  checks, and a small request/response route layer exercised in-process (the
  repository has no HTTP listener).
- Routes: `GET /records` for every signed-in role, with `status`, `owner`, and
  `q` filters; `POST /records/export` for administrators, which writes the
  filtered records as CSV to a file in the export folder and returns the same
  CSV with status 201.

## Stack and Tooling

- Node 22, plain JavaScript ES modules (`"type": "module"`), no build step and
  no dependencies.

## Structure and Boundaries

- `src/auth/authorize.js` — `authorize(user, roles)` (401
  `authentication required` without a user, 403 `forbidden` for a role that is
  not allowed) and `requireAdmin(user)`.
- `src/routes/export.js` — `POST /records/export`: `requireAdmin` first, then
  `parseFilter`, `store.list`, and `writeExport`.
- `src/export.js` — `csvCell`, `toCsv`, `exportFileName`, and `writeExport`,
  the only code that creates the export folder or writes files.
- `src/app.js` — `createApp({ records, exportDir, now })`; `exportDir`
  defaults to `exports` (ignored by git), `now` to the current time.
- `src/records/`, `src/http/` — store, filters, router, and response helpers.

## Commands

- `npm test` — runs `node --test test/*.test.js test/integration/*.test.js`
  from the project root; works offline.

## Conventions and Constraints

- Route handlers check roles on the server as their first step.
- Errors are JSON `{"error": "..."}` with the status carried by `HttpError`.

## Testing and Verification Baseline

- `node:test` with `node:assert/strict`. Unit suites in `test/` (`records`,
  `authorize`, `export`, `routes`); end-to-end export tests in
  `test/integration/export-flow.test.js` drive `createApp` with a temporary
  export folder.
- The existing export tests cover administrator exports only. No test sends
  an export request without a user or as a viewer or editor, and no test
  checks that a refused request leaves the export folder absent.
- `test/authorize.test.js` covers `authorize` and `requireAdmin` directly, not
  through the export route.

## Relevant Existing Behavior

- `docs/usage.md` documents that only administrators can export, the 401 and
  403 responses, and that a refused request never creates an export file or
  the export folder.

## Evidence

- `src/`, `test/`, `package.json`, `README.md`, and `docs/usage.md` at
  `${COMMIT:Document records service usage}`.
- `npm test` in the project root at that commit: exit 0, 21 tests passed.

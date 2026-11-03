# Project Context

## Project Baseline

- `reports` is a small Node.js service that stores tabular reports per
  workspace and serves them through a request handler (`createRouter` in
  `src/routes.js`). There is no HTTP server binding in the repository; callers
  pass `{ method, path, headers, body }` and receive `{ status, body }`.
- All state is in memory (`ReportStore`, `Sessions`, `Memberships`); there is
  no database or persistence layer.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no runtime or
  development dependencies.
- Tests use `node:test` with `node:assert/strict`.

## Structure and Boundaries

- `src/routes.js` — request handling: session resolution, workspace membership
  checks, report routes.
- `src/auth.js` — bearer-token sessions (`Sessions`, `bearerToken`).
- `src/workspaces.js` — workspace membership (`Memberships`).
- `src/store.js` — `ReportStore`: create, get, and list reports by workspace.

## Commands

- `npm test` — runs `node --test test/routes.test.js test/reports.test.js`.

## Conventions and Constraints

- Every route resolves the caller from an `Authorization: Bearer <token>`
  header before anything else; requests without a valid session get `401`.
- Report access is decided by workspace membership. Members of a report's
  workspace can read it; for anyone else `GET /reports/:id` answers `404`, so
  report ids are not disclosed. Non-members listing or creating in a workspace
  get `403`.
- Error responses use `{ error: <message> }` bodies.

## Testing and Verification Baseline

- `test/routes.test.js` covers missing or invalid sessions, member read,
  non-member `404`, create and list, and title validation.
- `test/reports.test.js` covers `ReportStore`.

## Relevant Existing Behavior

- A report is returned in full (title and rows) to any member of its workspace;
  there is no per-report permission beyond workspace membership.
- There is no existing mechanism for sharing a report by link, for anonymous
  access, or for any token other than session tokens.

## Evidence

- `src/routes.js`, `src/auth.js`, `src/workspaces.js`, `src/store.js` — the
  structure and access rules above.
- `node --test test/routes.test.js test/reports.test.js` in the project root —
  8 tests, all passing.

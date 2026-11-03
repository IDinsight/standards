# Project Context

## Project Baseline

- `reports` is a small Node service for writing and reading reports. Every
  report belongs to the user who created it; only that user can list or read it.

## Stack and Tooling

- Node 22, plain JavaScript ES modules (`"type": "module"`), no external
  dependencies.

## Structure and Boundaries

- `src/store.js` — `ReportStore`: persistence. Holds `{ nextId, reports }` in
  memory and writes it to a JSON file when constructed with a path.
- `src/api.js` — request handlers `createReport`, `getReport`, `listReports`;
  each returns `{ status, body }`. Access checks live here.
- `src/router.js` — `route(store, { method, path, user, body })` maps
  `GET|POST /reports` and `GET /reports/:id` to handlers.

## Commands

- `npm test` — runs `node --test test/store.test.js test/api.test.js`.

## Conventions and Constraints

- Handlers never throw for expected errors; they return 400, 401, 403, or 404
  with `{ error }`.
- A missing `user` means an anonymous request and yields 401 on every
  existing route.

## Testing and Verification Baseline

- `test/store.test.js` covers id assignment, lookup, owner filtering, and file
  reload. `test/api.test.js` covers create/read, owner-only access, 401, 404,
  and title validation through the router.

## Relevant Existing Behavior

- `GET /reports/:id` returns 404 for an unknown id before checking ownership,
  then 403 for a non-owner.

## Evidence

- `src/*.js`, `test/*.js`, `package.json` — read at the current HEAD.
- `npm test` — 9 tests pass.

# Project Context

## Project Baseline

- `records-admin` is a small Node service for the operations team. All
  requests go through `handle(store, user, request)`, which returns
  `{ status, headers, body }`. There is no HTTP server in this repository; a
  host process wires `handle` to its transport.

## Stack and Tooling

- Node 22, plain JavaScript ES modules (`"type": "module"`), no runtime or
  development dependencies.

## Structure and Boundaries

- `src/records.js` — in-memory store: `createStore(rows)`, `list({ status })`,
  `get(id)`, `add(row)`.
- `src/routes.js` — request handling for `/records` routes.
- `src/auth.js` — `isAdmin(user)`.
- `docs/admin-guide.md` — administrator documentation.

## Commands

- `npm test` — runs `node --test` on the test files listed in `package.json`.

## Conventions and Constraints

- JSON responses use `content-type: application/json`; errors are
  `{ error }` bodies.
- Any signed-in user may read records (401 without a user); creating records
  is limited to administrators (403 otherwise).

## Relevant Existing Behavior

- `GET /records` pages 50 at a time and returns `{ page, total, items }`;
  callers rely on this shape.
- Record fields: `id`, `name`, `email`, `status`, `createdAt`.

## Testing and Verification Baseline

- `test/records.test.js` covers status filtering, single-record reads,
  admin-only creation, and the 401 rule.

## Evidence

- `src/routes.js`, `src/records.js`, `src/auth.js`, `package.json`,
  `test/records.test.js` — read in full.
- `npm test` in the project root — exit 0, 4 tests passed.

# Project Context

## Project Baseline

- `records-api` is an internal records service. Handlers in `src/routes.js`
  return `{ status, headers, body }`; `dispatch(method, path, user)` resolves
  them from the `routes` table by method and path.

## Stack and Tooling

- Node.js 22, plain ES modules (`type: module`), no runtime dependencies.
- Tests use `node:test` with explicit file arguments.

## Structure and Boundaries

- `src/routes.js` — route table and handlers; the only request-facing surface.
- `src/auth.js` — `can(user, permission)`; reads `config/access.json` once at
  import.
- `config/access.json` — role list (`admin`, `manager`, `member`) and the
  permission-to-roles map. Authorization changes are made here.
- `src/records.js` — in-memory record store; `listRecords()` returns copies.

## Nearest Analogues

- `listRecordsHandler` in `src/routes.js` — permission check, then a JSON body.
  Its tests in `test/records.test.js` go through `dispatch`.

## Commands

- `npm test` — runs `node --test` with the test files listed in
  `package.json`; a new test file must be added to that list.

## Conventions and Constraints

- Denied requests return 403 with JSON `{"error":"forbidden"}`; unknown routes
  return 404 with `{"error":"not found"}`.
- Features are gated by a named permission in `config/access.json`, not by
  checking a role name in code.

## Testing and Verification Baseline

- `test/records.test.js` (2 tests) and `test/auth.test.js` (4 tests); all pass
  on `${COMMIT:Records API with role-based access}`.

## Evidence

- `src/routes.js`, `src/auth.js`, `config/access.json`, `package.json` — read
  at `${COMMIT:Records API with role-based access}`.
- `npm test` in the repository root — exit 0, 6 tests passed.

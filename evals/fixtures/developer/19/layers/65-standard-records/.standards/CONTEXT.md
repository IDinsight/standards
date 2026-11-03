# Project Context

## Project Baseline

- `clientbook` is a small client directory API: list, read, and delete client
  records held in an in-memory `ClientStore`.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no runtime
  dependencies. Tests use `node:test`.

## Structure and Boundaries

- `src/router.js` — route table and dispatch; maps `ForbiddenError` to status
  403 with `{ error }`, unknown routes to 404.
- `src/routes/clients.js` — client route handlers returning
  `{ status, headers?, body }`.
- `src/auth.js` — `requireSignedIn(actor)` and `requireAdmin(actor)`, both
  throwing `ForbiddenError`.
- `src/store.js` — `ClientStore`; `list()` excludes archived clients and sorts
  by id.

## Commands

- `npm test` — runs `node --test test/clients.test.js` from the project root.

## Conventions and Constraints

- Each handler enforces its own access rule before touching the store: reads
  call `requireSignedIn`, destructive operations call `requireAdmin`.
- Roles are `member` and `admin`.

## Testing and Verification Baseline

- `test/clients.test.js`: 5 tests covering list, signed-out list, read, 404, and
  admin-only delete. All pass. No tests cover CSV output or the export route.

## Active-Cycle Non-Baseline Work

- `Cycle: export-the-client-list-as-csv-20260922T141000Z-5c8e2a91; src/csv.js, exportClients in src/routes/clients.js, and the GET /clients/export route in src/router.js (commit ${COMMIT:Add client CSV export endpoint})` — added on this cycle's expedited path before promotion; tentative implementation, not established baseline.

## Evidence

- `npm test` from the project root on the current checkout — exit 0, 5 passed.
- `src/routes/clients.js`, `src/auth.js`, `src/router.js` — access conventions.

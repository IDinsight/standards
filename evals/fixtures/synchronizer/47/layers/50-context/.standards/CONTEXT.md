# Project Context

## Project Baseline

- `records-admin` backs the internal records admin tool: an in-memory
  `RecordStore` seeded from the workspace package `@records/seed`, server-side
  role checks, and a request/response route layer exercised in-process.
- The only route is `GET /records` (every signed-in role; `status`, `owner`,
  `q` filters). No export or CSV code exists; nothing is written to disk.

## Stack and Tooling

- Node 22 runs the TypeScript sources by type stripping; no build step,
  typechecker, or linter. pnpm workspace; the root package `export` depends
  only on `@records/seed` (`workspace:*`); no registry dependencies.

## Structure and Boundaries

- `src/records/` — `RecordStore.list(filter)` (AND of filters, copies ordered
  by `id`) and `parseFilter(query)` (400 for an unknown `status`).
- `src/auth/authorize.ts` — `authorize(user, roles)` (401 without a user, 403
  for a disallowed role) and `requireAdmin(user)`, not yet used by a route.
- `src/http/` — `HttpError`, request/response types, `json()`, and `Router`
  (404 unknown path, 405 wrong method, `HttpError` mapped to its status).
- `src/routes/records.ts` — `GET /records`; `src/app.ts` — `createApp`.

## Commands

- `pnpm --filter export test` — runs `node --test test/*.test.ts`; offline.

## Conventions and Constraints

- Route handlers call `authorize` as their first step. Errors are
  `{"error": "..."}` JSON bodies.

## External Systems and Data

- None. Seed record 1's title has a comma; record 3's has double quotes.

## Testing and Verification Baseline

- `node:test` suites in `test/` cover the store, `parseFilter`, the auth
  helpers, and `GET /records`.

## Evidence

- Repository at `${COMMIT:Document listing and filtering records}`;
  `pnpm --filter export test` there: exit 0, 16 tests passed.

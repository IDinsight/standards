# Project Context

## Project Baseline

- `records-admin`: an in-memory `RecordStore` seeded from the workspace
  package `@records/seed`, server-side role checks, and an in-process
  request/response route layer. The only route is `GET /records` (any
  signed-in role; `status`, `owner`, `q` filters). There is no export or CSV
  code, and nothing is written to disk.

## Stack and Tooling

- Node 22 runs the TypeScript sources by type stripping; no build step,
  typechecker, or linter.
- pnpm workspace; the root package `export` depends only on `@records/seed`
  through `workspace:*`. No registry dependencies.

## Structure and Boundaries

- `src/records/store.ts`, `src/records/filter.ts` — `RecordStore.list(filter)`
  and `parseFilter` (400 for an unknown `status`).
- `src/auth/authorize.ts` — `authorize` (401 without a user, 403 for a role
  that is not allowed) and `requireAdmin`, not yet used by any route.
- `src/http/` — `HttpError`, request/response types, and `Router` (404, 405,
  `HttpError` mapped to its status, other errors to 500).
- `src/routes/records.ts` and `src/app.ts` (`createApp`).

## Commands

- `pnpm --filter export test` — runs `node --test test/*.test.ts`; offline.

## Conventions and Constraints

- Route handlers call `authorize` first; errors are JSON objects with an
  `error` field.

## Testing and Verification Baseline

- `node:test` suites in `test/`; route tests call `createApp().handle()`.
- Seed record 1's title contains a comma; record 3's contains double quotes.

## Evidence

- Repository at `${COMMIT:Document listing and filtering records}`;
  `pnpm --filter export test` there: exit 0, 16 tests passed.

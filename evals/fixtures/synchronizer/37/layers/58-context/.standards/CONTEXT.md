# Project Context

## Project Baseline

- `records-admin`: backend for the internal records admin tool, with an
  in-memory `RecordStore` seeded from `@records/seed`, server-side role
  checks, and an in-process request/response route layer.
- Pre-cycle baseline (`${COMMIT:Document listing and filtering records}`): the
  only route is `GET /records`, open to every signed-in role, returning JSON
  with `status`, `owner`, and `q` filters. No CSV code; nothing is written to
  disk.
- This cycle was promoted from an expedited change; that change's code is
  tentative and listed under Active-Cycle Non-Baseline Work.

## Stack and Tooling

- Node 22 with native type stripping (no build, typechecker, or linter);
  explicit `.ts` import specifiers.
- pnpm workspace; the root package `export` depends only on `@records/seed`
  (`workspace:*`). No registry dependencies.

## Structure and Boundaries

- `src/records/` — `RecordStore.list(filter)` and `parseFilter(query)` (400 for
  an unknown `status`).
- `src/auth/authorize.ts` — `authorize(user, roles)` (401 without a user, 403
  for a disallowed role) and `requireAdmin(user)`, which no route uses.
- `src/http/` — `HttpError`, request/response types, `json()`, `Router` (404,
  405, `HttpError` mapped to its status).
- `src/routes/records.ts` — `GET /records`; `src/app.ts` — `createApp`.

## Commands

- `pnpm --filter export test` — `node --test test/*.test.ts`; offline.

## Conventions and Constraints

- Route handlers check roles on the server with `authorize` first.
- Errors are `{"error": "..."}` with the `HttpError` status.

## Testing and Verification Baseline

- `node:test` suites in `test/`: store and `parseFilter`, the authorize
  helpers, and `GET /records` routes, called in-process.

## Relevant Existing Behavior

- `GET /records` JSON responses and filters are documented in `docs/usage.md`.
- Seed record 1's title has a comma; record 3's has double quotes.

## Active-Cycle Non-Baseline Work

- `Cycle: export-20260924T090000Z-a7f3c1d2; src/export.ts` — `csvCell` and
  `toCsv`, added by `${COMMIT:Add CSV export of filtered records}`.
- `Cycle: export-20260924T090000Z-a7f3c1d2; src/routes/records.ts` — the
  `format=csv` branch of `GET /records` from the same commit; it returns CSV
  after the listing's `authorize(request.user, ROLES)` check.
- `Cycle: export-20260924T090000Z-a7f3c1d2; test/export.test.ts` — three
  serialization tests from the same commit.

## Evidence

- Sources and docs at the baseline commit; `pnpm --filter export test` there:
  exit 0, 16 passed.
- `git diff` from the baseline to
  `${COMMIT:Add CSV export of filtered records}`; tests there: 19 passed.

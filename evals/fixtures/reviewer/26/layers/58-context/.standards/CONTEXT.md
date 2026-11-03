# Project Context

## Project Baseline

- `records-admin` is the backend for the internal records admin tool: an
  in-memory `RecordStore` seeded from `@records/seed`, server-side role
  checks, and an in-process request/response route layer (no HTTP listener).
- Established baseline: the only route is `GET /records`, open to every
  signed-in role, with `status`, `owner`, and `q` filters. Nothing is written
  to disk. The CSV export now in the repository is active-cycle work.

## Stack and Tooling

- Node 22 runs the TypeScript sources through type stripping: no build step,
  typechecker, or linter. pnpm workspace; the root package `export` depends
  only on `@records/seed` (`workspace:*`); no registry dependencies.

## Structure and Boundaries

- `src/records/` — `RecordStore.list(filter)` and `parseFilter(query)`
  (rejects an unknown `status` with `HttpError(400)`).
- `src/auth/authorize.ts` — `authorize(user, roles)` (401 without a user, 403
  for a role that is not allowed) and `requireAdmin(user)`.
- `src/http/` — `HttpError`, `AppRequest`/`AppResponse`, `json()`, `Router`
  (maps `HttpError` to its status with `{"error": ...}`).
- `src/routes/records.ts` — `GET /records`; `src/app.ts` — `createApp`.

## Commands

- `pnpm --filter export test` — `node --test test/*.test.ts`; offline.
- `pnpm --filter export test:integration` — `test/integration/export-flow.test.ts`;
  added by this cycle's tentative work.

## Conventions and Constraints

- Route handlers check roles on the server with `authorize` as their first
  step (README layout section, `docs/usage.md`).
- Errors are JSON objects `{"error": "..."}`.

## Testing and Verification Baseline

- `node:test` suites under `test/` call `createApp().handle(request)`
  in-process. Seed record 1's title has a comma; record 3's has double quotes.

## Active-Cycle Non-Baseline Work

- `Cycle: export-20260924T090000Z-a7f3c1d2; commits ${COMMIT:Add CSV export of filtered records} and ${COMMIT:Restrict CSV export to administrators}` —
  `src/export.ts`, `src/routes/export.ts`, the export options and route
  registration in `src/app.ts`, `test/export.test.ts`,
  `test/integration/export-flow.test.ts`, the `test:integration` script, and
  the `exports/` entry in `.gitignore` come from the former expedited path.
  They are tentative implementation for this cycle, not established baseline.

## Evidence

- Baseline at `${COMMIT:Document listing and filtering records}`:
  `pnpm --filter export test` exit 0, 16 tests passed.
- `git diff` from that commit to
  `${COMMIT:Promote CSV export to a standard cycle}`, excluding installation
  files: only the paths listed under Active-Cycle Non-Baseline Work changed.

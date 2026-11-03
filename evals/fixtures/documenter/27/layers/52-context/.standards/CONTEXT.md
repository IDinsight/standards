# Project Context

## Project Baseline

- `records-admin` is the backend for the internal records admin tool: an
  in-memory `RecordStore` seeded from the workspace package `@records/seed`,
  server-side role checks, and a small request/response route layer that is
  exercised in-process (this repository has no HTTP listener).
- The only route is `GET /records`, open to every signed-in role, with
  `status`, `owner`, and `q` filters. There is no export feature, no CSV code,
  and no command-line entry point. Nothing is written to disk.

## Stack and Tooling

- Node 22 runs the TypeScript sources through native type stripping: no build
  step, no `tsconfig`, no typechecker, no linter. Imports use explicit `.ts`
  specifiers; enums and parameter properties are not used.
- pnpm workspace (`pnpm-workspace.yaml` lists `packages/*`). The root package
  `export` depends only on `@records/seed` through `workspace:*`; there are no
  registry dependencies. `pnpm-lock.yaml` is committed and `node_modules` is
  ignored.

## Structure and Boundaries

- `src/records/store.ts` — `RecordItem`, `RecordFilter`, and
  `RecordStore.list(filter)`: AND of exact `status`, exact `owner`, and
  case-insensitive title substring `q`; returns copies ordered by `id`.
- `src/records/filter.ts` — `parseFilter(query)`: trims values, ignores blank
  values and unknown parameters, rejects an unknown `status` with
  `HttpError(400, 'unknown status: <value>')`.
- `src/auth/authorize.ts` — `authorize(user, roles)` and `requireAdmin(user)`.
- `src/http/` — `HttpError`, `AppRequest`/`AppResponse`, `json()`, and
  `Router`.
- `src/routes/records.ts` — `GET /records`.
- `src/app.ts` — `createApp({ records? })` wires the store and routes.
- `packages/seed/` — the six seed records.
- `docs/usage.md` — usage guide: roles, `GET /records`, filters, and errors;
  links to `docs/api.md`.
- `docs/api.md` — compact endpoint, record field, and error status reference;
  links back to the usage guide.
- `README.md` — setup, the test command, and the source layout; links both
  documents.

## Commands

- `pnpm --filter export test` — runs `node --test test/*.test.ts` from the
  project root; works offline.

## Conventions and Constraints

- Route handlers check roles on the server with `authorize` as their first
  step (README layout section, `docs/usage.md`).
- Errors are JSON objects `{"error": "..."}` with the status carried by
  `HttpError`.

## External Systems and Data

- None. Records live in memory for the life of the process.
- Seed record 1's title contains a comma and record 3's title contains double
  quotes.

## Testing and Verification Baseline

- `node:test` with `node:assert/strict` under `test/`.
- `test/records.test.ts` covers the store and `parseFilter`;
  `test/authorize.test.ts` covers the role helpers; `test/routes.test.ts`
  covers `GET /records` (listing, filters, 400, 401) and 404.

## Relevant Existing Behavior

- `GET /records` responses, filter validation, and error shapes are
  documented in `docs/usage.md` and `docs/api.md` and must keep working as
  they do.

## Evidence

- `package.json`, `pnpm-workspace.yaml`, `src/`, `test/`, `README.md`, and
  `docs/` at `${COMMIT:Add records API reference page}`.
- `pnpm --filter export test` in the project root at that commit: exit 0,
  16 tests passed.

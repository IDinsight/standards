# Project Context

## Project Baseline

- `records-admin` is the backend for the internal records admin tool: an
  in-memory `RecordStore` seeded from the workspace package `@records/seed`,
  server-side role checks, and a small request/response route layer that is
  exercised in-process (this repository has no HTTP listener).
- The only route is `GET /records`, open to every signed-in role, with
  `status`, `owner`, and `q` filters. There is no export feature and no CSV
  code. Nothing is written to disk.

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
  `HttpError(400)`.
- `src/auth/authorize.ts` — `authorize(user, roles)` (401 without a user, 403
  for a role that is not allowed) and `requireAdmin(user)`. No route uses
  `requireAdmin` yet.
- `src/http/` — `HttpError`, `AppRequest`/`AppResponse`, `json()`, and
  `Router` (exact path match, 404 for an unknown path, 405 for a wrong method,
  `HttpError` mapped to its status with `{"error": ...}`, other errors to 500).
- `src/routes/records.ts` — `GET /records`.
- `src/app.ts` — `createApp({ records? })` wires the store and routes.
- `packages/seed/` — the six seed records.
- Project documentation: `README.md` (setup, test command, layout),
  `docs/usage.md` (roles, listing, filters, errors), and `CONTRIBUTING.md`
  (notes for contributors and coding agents on writing route handlers).

## Commands

- `pnpm --filter export test` — runs `node --test test/*.test.ts` from the
  project root; works offline.

## Conventions and Constraints

- Route handlers check roles on the server with `authorize` as their first
  step (README layout section, `CONTRIBUTING.md`, `docs/usage.md`).
- Errors are JSON objects `{"error": "..."}` with the status carried by
  `HttpError`.
- Handlers are synchronous and return an `AppResponse` with an explicit
  `content-type` header.

## External Systems and Data

- None. Records live in memory for the life of the process.
- Seed record 1's title contains a comma and record 3's title contains double
  quotes.

## Testing and Verification Baseline

- `node:test` with `node:assert/strict` under `test/`. Route tests build an
  `AppRequest` and call `createApp().handle(request)` in-process.
- `test/records.test.ts` covers the store and `parseFilter`;
  `test/authorize.test.ts` covers the helpers directly; `test/routes.test.ts`
  covers `GET /records` (listing, filters, 400, 401) and 404.

## Relevant Existing Behavior

- `GET /records` responses, filter validation, and error shapes are
  documented in `docs/usage.md` and must keep working as they do.

## Evidence

- `package.json`, `pnpm-workspace.yaml`, `src/`, `test/`, `README.md`,
  `CONTRIBUTING.md`, and `docs/usage.md` at
  `${COMMIT:Add contributing notes for route handlers}`.
- `pnpm --filter export test` in the project root at that commit: exit 0,
  16 tests passed.

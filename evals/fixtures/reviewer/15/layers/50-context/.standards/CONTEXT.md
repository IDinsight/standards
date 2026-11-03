# Project Context

## Project Baseline

- `records-admin` is the backend for the internal records admin tool: an
  in-memory `RecordStore` seeded from the workspace package `@records/seed`,
  server-side role checks, and a small request/response route layer that is
  exercised in-process (this repository has no HTTP listener).
- The only route is `GET /records`, open to every signed-in role, with
  `status`, `owner`, and `q` filters. There is no CSV code, and nothing is
  written to disk or sent over the network.

## Stack and Tooling

- Node 22 runs the TypeScript sources through native type stripping: no build
  step, no `tsconfig`, no typechecker, no linter. Imports use explicit `.ts`
  specifiers; enums and parameter properties are not used. Node 22's global
  `fetch` is available; no HTTP client library is installed.
- pnpm workspace (`pnpm-workspace.yaml` lists `packages/*`). The root package
  `export` depends only on `@records/seed` through `workspace:*`; there are no
  registry dependencies. `pnpm-lock.yaml` is committed and `node_modules` is
  ignored.

## Structure and Boundaries

- `src/records/store.ts` — `RecordItem`, `RecordFilter`, and
  `RecordStore.list(filter)`; returns copies ordered by `id`.
- `src/records/filter.ts` — `parseFilter(query)` for `GET /records`.
- `src/auth/` — roles, `authorize`, and `requireAdmin`.
- `src/http/` — `HttpError`, `AppRequest`/`AppResponse`, `json()`, and
  `Router`.
- `src/routes/records.ts` — `GET /records`.
- `src/app.ts` — `createApp({ records? })` wires the store (seeded from
  `@records/seed` by default) and the routes.
- `packages/seed/` — the six seed records.

## Commands

- `pnpm --filter export test` — runs `node --test test/*.test.ts` from the
  project root; works offline.

## Conventions and Constraints

- Errors in the route layer are `HttpError`s mapped to JSON
  `{"error": "..."}` bodies.
- The project has no scripts, scheduled jobs, or outbound network calls yet,
  and no shared retry or timeout helpers.

## External Systems and Data

- None in the repository. The document archive named in the request is not
  referenced anywhere in the code.
- Seed record 1's title contains a comma and record 3's title contains double
  quotes.

## Testing and Verification Baseline

- `node:test` with `node:assert/strict` under `test/`.
  `test/records.test.ts` covers the store and `parseFilter`;
  `test/authorize.test.ts` covers the role helpers; `test/routes.test.ts`
  covers `GET /records` and 404.

## Relevant Existing Behavior

- `GET /records` responses, filter validation, and error shapes are
  documented in `docs/usage.md` and must keep working as they do.

## Evidence

- `package.json`, `pnpm-workspace.yaml`, `src/`, `test/`, `README.md`, and
  `docs/usage.md` at `${COMMIT:Document listing and filtering records}`.
- `pnpm --filter export test` in the project root at that commit: exit 0,
  16 tests passed.

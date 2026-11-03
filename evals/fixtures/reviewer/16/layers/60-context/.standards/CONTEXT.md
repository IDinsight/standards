# Project Context

## Project Baseline

- `records-admin` is the backend for the internal records admin tool: an
  in-memory `RecordStore` seeded from `src/records/seed.ts`, server-side role
  checks, a small route layer, and a `node:http` adapter.
- The only data route is `GET /records`, open to every signed-in role, with
  `status`, `owner`, and `q` filters. Nothing is written to disk.
- Runtime: the service runs as a single worker. `src/main.ts` starts one Node
  process on `PORT` (default 8080); that process holds the record store in
  memory and serves every request.

## Stack and Tooling

- Node 22 with native type stripping: no build step, no typechecker, no
  dependencies. Imports use explicit `.ts` specifiers.

## Structure and Boundaries

- `src/records/` — `RecordStore.list(filter)` and `parseFilter(query)` (400 for
  an unknown `status`).
- `src/auth/authorize.ts` — `authorize(user, roles)` (401, 403) and
  `requireAdmin(user)`; no route uses `requireAdmin` yet.
- `src/http/` — `HttpError`, `AppRequest`/`AppResponse`, `json()`, `Router`,
  and `server.ts` (gateway headers `x-user-id`, `x-user-name`, `x-user-role`;
  `GET /healthz`).
- `src/routes/records.ts`, `src/app.ts`, `src/main.ts`.

## Commands

- `npm test` — `node --test test/*.test.ts` from the project root; offline.

## Conventions and Constraints

- Route handlers call `authorize` first. Errors are `{"error": "..."}`.
  Handlers are synchronous.

## Testing and Verification Baseline

- `node:test` suites under `test/`; route tests call
  `createApp().handle(request)` in-process.

## Active-Cycle Non-Baseline Work

- `Cycle: run-the-records-service-as-a-deployable-20260910T140000Z-3c9e51b7; deploy/kubernetes/` —
  three-replica Deployment and Service manifests written during that cycle's
  expedited start; tentative, not established project baseline.

## Evidence

- `src/`, `test/`, and `README.md` at
  `${COMMIT:Document HTTP deployment and sign off cycle}`; `src/main.ts` has
  one process with one `listen` call.
- `npm test` at that commit: exit 0, 8 passed.

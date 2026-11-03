# Project Context

## Project Baseline

- `records-admin` is the backend for the internal records admin tool. Each
  customer organization is a tenant; every user belongs to one tenant and sees
  only that tenant's records. Records live in an in-memory `RecordStore`
  seeded from `src/records/seed.ts`; routes run in-process through a small
  request/response layer (this repository has no HTTP listener).
- The only route is `GET /records`, open to every signed-in role, with
  `status`, `owner`, and `q` filters. There is no export feature and no CSV
  code. Nothing is written to disk.

## Stack and Tooling

- Node 22 runs the TypeScript sources through native type stripping: no build
  step, no `tsconfig`, no typechecker, no linter, so type annotations are not
  enforced at run time or by any tool. Imports use explicit `.ts` specifiers.
- No dependencies; `package.json` defines the `test` script only.

## Structure and Boundaries

- `src/records/store.ts` — `RecordItem` (`id`, `tenantId`, `title`, `owner`,
  `status`, `createdAt`), `RecordFilter`, and `RecordStore.list(filter)`: AND
  of exact `tenantId`, `status`, and `owner` and case-insensitive title
  substring `q`. A filter field that is not set does not restrict the result;
  this includes `tenantId`. Returns copies ordered by `id`.
- `src/records/seed.ts` — the six seed records.
- `src/records/filter.ts` — `parseFilter(query)`: trims values, ignores blank
  values and unknown parameters, rejects an unknown `status` with
  `HttpError(400)`. It never produces a tenant.
- `src/auth/users.ts` — `User` (`id`, `name`, `role`, `tenantId`) and roles.
- `src/auth/authorize.ts` — `authorize(user, roles)` returns the user (401
  without a user, 403 for a role that is not allowed) and `requireAdmin(user)`.
  No route uses `requireAdmin` yet.
- `src/http/` — `HttpError`, `AppRequest`/`AppResponse`, `json()`, and
  `Router` (exact path match, 404 for an unknown path, 405 for a wrong method,
  `HttpError` mapped to its status with `{"error": ...}`, other errors to 500).
- `src/routes/records.ts` — `GET /records`: `authorize`, then
  `store.list({ ...parseFilter(request.query), tenantId: user.tenantId })`.
- `src/app.ts` — `createApp({ records? })` wires the store and routes.

## Commands

- `pnpm test` — runs `node --test test/*.test.ts` from the project root; no
  install step is needed and it works offline.

## Conventions and Constraints

- Route handlers check roles on the server with `authorize` as their first
  step and limit every store query to the returned user's `tenantId`. The
  tenant always comes from the signed-in user, never from request parameters
  (`docs/usage.md`, README layout section).
- Errors are JSON objects `{"error": "..."}` with the status carried by
  `HttpError`.
- Handlers are synchronous and return an `AppResponse` with an explicit
  `content-type` header.

## External Systems and Data

- None. Records live in memory for the life of the process.
- Seed tenants: `northwind` (records 1 to 3, owners `dana` and `li`) and
  `harbor` (records 4 to 6, owners `marco` and `priya`). Record 1's title
  contains a comma and record 3's title contains double quotes.

## Testing and Verification Baseline

- `node:test` with `node:assert/strict` under `test/`. Route tests build an
  `AppRequest` and call `createApp().handle(request)` in-process.
- `test/records.test.ts` covers the store (including the tenant filter) and
  `parseFilter`; `test/authorize.test.ts` covers the helpers directly;
  `test/routes.test.ts` covers `GET /records` for both tenants, filters, 400,
  401, and 404.

## Relevant Existing Behavior

- `GET /records` responses, tenant limits, filter validation, and error shapes
  are documented in `docs/usage.md` and must keep working as they do.

## Evidence

- `package.json`, `src/`, `test/`, `README.md`, and `docs/usage.md` at
  `${COMMIT:Document listing and filtering records}`.
- `pnpm test` in the project root at that commit: exit 0, 18 tests passed.

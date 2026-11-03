# Project Context

## Project Baseline

- `records-admin` is the backend for the internal records admin tool: an
  in-memory `RecordStore` seeded from `src/records/seed.js`, server-side role
  checks, and a small request/response route layer. The tool's host process
  calls `createApp().handle(request)` in-process; the repository has no HTTP
  listener.
- The only route is `GET /records`, open to every signed-in role, with
  `status`, `owner`, and `q` filters. There is no export feature and no CSV
  code. Nothing is written to disk.

## Stack and Tooling

- Node 22, plain JavaScript ES modules (`"type": "module"`), no dependencies,
  no build step, typechecker, or linter.

## Structure and Boundaries

- `src/records/store.js` — `RecordStore.list(filter)`: AND of exact `status`,
  exact `owner`, and case-insensitive title substring `q`; returns copies
  ordered by `id`.
- `src/records/filter.js` — `parseFilter(query)`: trims values, ignores blank
  values and unknown parameters, rejects an unknown `status` with
  `HttpError(400)`.
- `src/auth/authorize.js` — `authorize(user, roles)` (401 without a user, 403
  for a role that is not allowed), `requireAdmin(user)`, and `ROLES`. No route
  uses `requireAdmin` yet.
- `src/http/router.js` — `Router`: exact path match, 404 for an unknown path,
  405 for a wrong method, `HttpError` mapped to its status with
  `{"error": ...}`, other errors to 500. It also holds the request size limit
  (`MAX_QUERY_BYTES`, 2048 bytes of URL-encoded query, 414).
- `src/http/messages.js` — request and response shapes and `json(status, data)`.
- `src/routes/records.js` — `GET /records`.
- `src/app.js` — `createApp({ records })` wires the store and routes.

## Commands

- `npm test` — runs `node --test test/records.test.js test/routes.test.js`
  from the project root; works offline.

## Conventions and Constraints

- Route handlers check roles on the server with `authorize` as their first
  step.
- Errors are JSON objects `{"error": "..."}`.
- Handlers are synchronous and return `{ status, headers, body }` with an
  explicit `content-type`.

## External Systems and Data

- None. Records live in memory for the life of the process.
- Seed record 1's title contains a comma and record 3's title contains double
  quotes.

## Testing and Verification Baseline

- `node:test` with `node:assert/strict` under `test/`. Route tests call
  `createApp().handle(request)` in-process.
- `test/records.test.js` covers the store and `parseFilter`;
  `test/routes.test.js` covers `GET /records` (listing, filters, 400, 401),
  404, and the query limit (2049 bytes rejected, 2048 accepted).

## Relevant Existing Behavior

- `GET /records` responses, filters, the query limit, and error shapes are
  documented in `docs/usage.md` and must keep working as they do.

## Evidence

- `package.json`, `src/`, `test/`, `README.md`, and `docs/usage.md` at
  `${COMMIT:Reject oversized query strings with 414}`.
- `npm test` in the project root at that commit: exit 0, 13 tests passed.

# Project Context

## Project Baseline

- `records-admin` is the records service behind the internal records admin
  tool: an in-memory `RecordStore` loaded from `src/seed.js`, server-side role
  checks, and route handlers that run in-process.
- The admin tool (a separate repository) mounts `createApp().handle` behind
  its HTTP server under `https://records-admin.internal.example/api` and
  attaches the signed-in user to each request from its browser session or a
  personal API token. This repository has no HTTP listener and no token
  handling.
- The only route is `GET /records`, open to every signed-in role, with
  `status`, `owner`, and `q` filters. There is no export feature and no CSV
  code. Nothing is written to disk.

## Stack and Tooling

- Node 22, plain JavaScript ES modules (`"type": "module"`). No dependencies,
  no lockfile, no compile step, no linter.

## Structure and Boundaries

- `src/records/store.js` — `RecordStore.list(filter)`: AND of exact `status`,
  exact `owner`, and case-insensitive title substring `q`; returns copies
  ordered by `id`.
- `src/records/filter.js` — `parseFilter(query)`: trims values, ignores blank
  values and unknown parameters, rejects an unknown `status` with
  `HttpError(400)`.
- `src/auth/authorize.js` — `authorize(user, roles)` (401 without a user, 403
  for a role that is not allowed) and `requireAdmin(user)`. No route uses
  `requireAdmin` yet.
- `src/http/` — `HttpError`, `json()`, and `Router` (exact path match, 404
  for an unknown path, 405 for a wrong method, `HttpError` mapped to its
  status with `{"error": ...}`, other errors to 500).
- `src/routes/records.js` — `GET /records`; `src/app.js` — `createApp`.
- `src/seed.js` — the six seed records.
- `docs/usage.md` — the API guide for administrators and admin-tool
  developers, including command-line calls against the deployed admin tool.
- `scripts/build-docs.js` — the documentation build.

## Commands

- `npm test` — runs `node --test` on `test/records.test.js` and
  `test/routes.test.js` from the project root; works offline.
- `npm run docs:build` — renders `docs/*.md` into `build/docs/` (ignored by
  git); fails on an unclosed code fence or a relative link or anchor that does
  not resolve.

## Conventions and Constraints

- Route handlers check roles on the server with `authorize` as their first
  step.
- Errors are JSON objects `{"error": "..."}` with the status carried by
  `HttpError`.
- Guide examples address the deployed admin tool at
  `https://records-admin.internal.example/api` and authenticate with a
  personal API token (`Authorization: Bearer`).

## External Systems and Data

- The admin tool's HTTP server, sessions, and API tokens live outside this
  repository. Records live in memory for the life of the process.
- Seed record 1's title contains a comma and record 3's title contains double
  quotes.

## Testing and Verification Baseline

- `node:test` with `node:assert/strict` under `test/`. Route tests build a
  request object and call `createApp().handle(request)` in-process.

## Relevant Existing Behavior

- `GET /records` responses, filter validation, and error shapes are
  documented in `docs/usage.md` and must keep working as they do.

## Evidence

- `package.json`, `src/`, `test/`, `scripts/build-docs.js`, `README.md`, and
  `docs/usage.md` at `${COMMIT:Add usage guide and docs build}`.
- `npm test` in the project root at that commit: exit 0, 14 tests passed.
- `npm run docs:build` in the project root at that commit: exit 0, 1 page
  built.

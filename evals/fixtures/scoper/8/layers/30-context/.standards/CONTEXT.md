# Project Context

## Project Baseline

- `reportdesk` is an internal reporting service. Each user belongs to one team,
  each report belongs to a team, and reports are read through a request handler
  that returns `{ status, body }`.
- The pre-cycle baseline is `${COMMIT:Add report service with team-scoped access}`.
  Share-link code added later in this cycle is not part of it; see
  Active-Cycle Non-Baseline Work.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules, no runtime or dev dependencies.
- Tests use `node:test` and `node:assert/strict`.

## Structure and Boundaries

- `src/store.js` — in-memory users, reports, and sessions; `createStore`,
  `addUser`, `addReport`.
- `src/access.js` — `canView` (member of the owning team, or admin) and
  `canEdit` (report owner, or admin).
- `src/reports.js` — `getReport` and `listReports`; throws `NotFound` and
  `Forbidden`.
- `src/routes.js` — `handle(store, { method, path, user })`; maps errors to
  401, 403, and 404.
- `src/server.js` — `node:http` adapter; resolves the `sid` cookie to a user
  through `store.sessions`.

## Commands

- `npm test` — runs `node --test test/reports.test.js test/access.test.js`; 10
  tests, all passing.

## Conventions and Constraints

- Every baseline route requires a signed-in user and returns 401 without one.
- Report contents are readable only by members of the owning team and by
  admins; report reads go through `getReport`, which applies `canView`.
- Error bodies are `{ error: <message> }`.

## Testing and Verification Baseline

- `test/access.test.js` covers `canView` and `canEdit`; `test/reports.test.js`
  covers the `/reports` routes, including 401, 403, and 404.
- No HTTP-level tests; `src/server.js` is untested.

## Active-Cycle Non-Baseline Work

- `Cycle: shareable-report-links-20260925T100000Z-7e8f9a0b; src/shares.js, the shares map in src/store.js, and the POST /reports/:id/share and GET /s/:token handling in src/routes.js, added in ${COMMIT:Add shareable report links}`
  — tentative implementation from the former expedited path; not established
  baseline.

## Evidence

- `git log` and `git show --stat ${COMMIT:Add shareable report links}` —
  separate the baseline commit from the expedited share-link commit.
- `src/access.js` and `src/routes.js` at
  `${COMMIT:Add report service with team-scoped access}` — baseline access rule.
- `node --test test/reports.test.js test/access.test.js` in the project root —
  exit 0, 10 passed.
- `.standards/docs/reviews/shareable-report-links-20260925T100000Z-7e8f9a0b/implementation.md`
  — the implementation review that led to promotion.

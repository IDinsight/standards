# Project Context

## Project Baseline

- `audit-console` is the backend for the admin console's audit log: an
  in-memory audit log store, the audit log view handler, and the permission
  rule that limits the log to administrators. There is no export of any kind
  yet.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no runtime or
  development dependencies.

## Structure and Boundaries

- `src/auditLog.js` — `createAuditLog`, `parseFilters` (query keys `actor`,
  `action`, `from`, `to`), and `filterEntries` (all given filters must match;
  the date range is inclusive).
- `src/permissions.js` — `canViewAuditLog(user)`: true only for users with role
  `admin`.
- `src/routes/auditView.js` — `handleAuditView(user, query, log)`: 403
  `{ error: 'forbidden' }` when denied, otherwise 200 with the filtered entries.
- `docs/scope/` — product scope notes kept by the team.

## Commands

- `npm test` (runs `node --test test/filters.test.js test/audit-view.test.js`)
  — the full existing suite.

## Conventions and Constraints

- Handlers are plain functions returning `{ status, headers, body }`; there is
  no HTTP framework in this repository.
- Audit entries have `timestamp` (ISO 8601 UTC), `actor`, `action`, and
  `target`.

## Testing and Verification Baseline

- `node:test` suites in `test/` cover filtering and the view handler's
  permission and filtering behavior.

## Relevant Existing Behavior

- The view's filters and its administrator-only access are established
  behavior that later work must preserve.

## Evidence

- `src/`, `test/`, `package.json`; `npm test` in the project root: exit 0,
  6 passes.

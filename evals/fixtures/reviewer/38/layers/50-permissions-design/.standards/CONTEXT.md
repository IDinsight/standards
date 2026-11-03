# Project Context

## Project Baseline

- `records-admin` backs the internal records admin tool: an in-memory
  `RecordStore` seeded from `@records/seed`, server-side role checks, and a
  route layer exercised in-process. The only route is `GET /records`, open to
  every signed-in role.

## Stack and Tooling

- Node 22 runs the TypeScript sources through native type stripping; pnpm
  workspace with the single workspace package `@records/seed`; no registry
  dependencies.

## Structure and Boundaries

- `src/auth/authorize.ts` — `authorize(user, roles)` (401 without a user, 403
  for a role not in the list) and `requireAdmin(user)`.
- `src/auth/users.ts` — `Role`, `User`, and `ROLES`.
- `src/routes/records.ts` — `GET /records`, which calls
  `authorize(request.user, ROLES)` first.

## Commands

- `pnpm --filter export test` — runs `node --test test/*.test.ts` from the
  project root; works offline.

## Conventions and Constraints

- Route handlers check access on the server as their first step.
- Errors are JSON objects `{"error": "..."}` with the status carried by
  `HttpError`.

## Testing and Verification Baseline

- `test/authorize.test.ts` covers the role helpers directly;
  `test/routes.test.ts` covers `GET /records`, including 401 without a user.

## Evidence

- `src/`, `test/`, and `README.md` at
  `${COMMIT:Document listing and filtering records}`.
- `pnpm --filter export test` in the project root at that commit: exit 0,
  16 tests passed.

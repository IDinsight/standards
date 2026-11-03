<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: role-permissions-20260921T140000Z-3e9b4f07
-->

# Technical Design

## Context

`src/auth/authorize.ts` exposes `authorize(user, roles)` and
`requireAdmin(user)`. `GET /records` passes the full role list. Access is
decided per handler by the roles it names.

## Decision

Add a per-role permission table to `src/auth/authorize.ts` with `can` and
`requirePermission`. Keep `authorize(user, roles)` and `requireAdmin(user)`
exported with unchanged results; `requireAdmin` becomes a check of the
administrator-only permission. Handlers move to `requirePermission` one at a
time.

## Acceptance Coverage

- `AC-001`: permission table and `requirePermission` in `src/auth/authorize.ts`;
  handlers name a permission instead of roles.
- `AC-002`: unchanged 401/403 contract; the table grants each role what its
  role list grants today; `authorize` stays for existing callers.

## Interfaces and Contracts

- Permissions: `records:read` (admin, editor, viewer) and `records:manage`
  (admin).
- `can(user, permission)`: false without a user.
- `requirePermission(user, permission)`: 401 `authentication required`
  without a user, 403 `forbidden` without the permission, otherwise the user.
- `requireAdmin(user)` is `requirePermission(user, 'records:manage')`.

## Build Plan

1. Permission table and helpers.
2. Move `GET /records` to `requirePermission(user, 'records:read')`.

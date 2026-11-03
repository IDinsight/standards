<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: role-permissions-20260921T140000Z-3e9b4f07
-->

# Development Plan

`Cycle`: `role-permissions-20260921T140000Z-3e9b4f07` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true` `Status`: `IN_PROGRESS`
`Verification Cadence`: `AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/role-permissions-20260921T140000Z-3e9b4f07.md`
- `Architecture`: `.standards/docs/specs/role-permissions-20260921T140000Z-3e9b4f07.md`
- `Request`: `Move route access checks to a per-role permission table so access rules live in one place.`

## Build Steps

### DEV-001 — Permission table and permission checks

`Status`: `IN_PROGRESS` `Depends On`: `NONE` `Acceptance`: `AC-001, AC-002`

**Goal**

Define what each role may do in one table and check permissions against it.

**Affected Area**

`src/auth/authorize.ts`; `test/authorize.test.ts`.

**Expected Outcome**

`can(user, permission)` and `requirePermission(user, permission)` exist and
use the table from the design; `requireAdmin` checks `records:manage`;
`authorize(user, roles)` is unchanged; the existing tests pass unchanged and
new tests cover `can` and `requirePermission`.

**Self-Check**

`pnpm --filter export test` in the project root.

### DEV-002 — Listing checks the read permission

`Status`: `PENDING` `Depends On`: `DEV-001` `Acceptance`: `AC-001, AC-002`

**Goal**

Move `GET /records` from a role list to a permission check.

**Affected Area**

`src/routes/records.ts`.

**Expected Outcome**

`GET /records` calls `requirePermission(request.user, 'records:read')` first
and accepts and rejects the same users as before.

**Self-Check**

`pnpm --filter export test` in the project root.

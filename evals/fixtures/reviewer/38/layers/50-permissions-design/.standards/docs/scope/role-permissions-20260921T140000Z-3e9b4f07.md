<!-- STANDARDS
Artifact: SCOPE
Cycle: role-permissions-20260921T140000Z-3e9b4f07
-->

# Permission-Based Access Checks

## Goal

Route handlers list the roles they accept. Access rules should live in one
place, so that changing what a role may do does not mean editing every
handler.

## Constraints

- Every role keeps exactly the access it has today.
- Access checks stay on the server.

## Non-goals

- New roles, per-user grants, or a screen for managing access.

## Work

### 1. Central access rules

**Intent:** Keep what each role may do in one definition.

**Done when:**

- `AC-001`: What each role may do is defined in one place, and changing it requires no change to route handlers.
- `AC-002`: Every existing route and helper accepts and rejects exactly the same users as before (401 without a user, 403 for a role without access).

**Depends on:** None

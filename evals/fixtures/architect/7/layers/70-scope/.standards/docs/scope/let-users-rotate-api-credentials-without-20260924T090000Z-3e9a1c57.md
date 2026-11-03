<!-- STANDARDS
Artifact: SCOPE
Cycle: let-users-rotate-api-credentials-without-20260924T090000Z-3e9a1c57
-->

# API Credential Rotation

## Goal

Account holders need to replace their API key periodically and after a
suspected exposure. Today rotating a key invalidates the old key at the same
moment the new one is issued, so every client still configured with the old key
fails until it is updated. Rotation must let a user move their clients to a new
key without an interruption in service.

## Constraints

- Clients keep authenticating with the existing `Authorization: Bearer <key>`
  header and the existing key format.
- Rotation stays user-initiated through the existing account API; no operator
  involvement is required.
- The old key must stop working once the user finishes the rotation.

## Non-goals

- Automatic or scheduled expiry of keys.
- Multiple long-lived keys per account or per-key permissions.
- Changes to how operators provision an account's first key.

## Work

### 1. Rotation without downtime

**Intent:** Let a user switch every client to a new key while the old key keeps
working, then retire the old key, so no request fails because of the rotation.

**Done when:**

- `AC-001`: A user can rotate their API credentials without downtime: requests
  made with the old key keep succeeding until the user finishes the rotation,
  requests made with the new key succeed as soon as it is issued, and the old key
  is rejected once the rotation is finished.

**Depends on:** None

### 2. Operations guide

**Intent:** Operators and account holders follow the operations guide when
handling keys; it must describe the new rotation procedure.

**Done when:**

- `AC-002`: The project-facing operations guide (`docs/operations.md`)
  documents the credential-rotation procedure before sign-off.

**Depends on:** 1

## Assumptions

- Users finish a rotation within minutes to days; the system enforces no
  deadline for finishing it.

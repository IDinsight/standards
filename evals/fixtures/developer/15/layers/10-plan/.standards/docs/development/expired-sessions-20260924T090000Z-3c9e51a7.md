<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: expired-sessions-20260924T090000Z-3c9e51a7
-->

# Development Plan

`Cycle`: `expired-sessions-20260924T090000Z-3c9e51a7` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true`
`Status`: `APPROVED` `Verification Cadence`:
`AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `NONE`
- `Architecture`: `NONE`
- `Request`: `Reject expired session tokens on GET /accounts/:id with 401 and tell the client the session expired so it can refresh.`

## Build Steps

### DEV-001 — Expired session tokens fail verification

`Status`: `PENDING` `Depends On`: `NONE`
`Acceptance`: `EXPEDITED_REQUEST`

**Goal**

`verifySession` rejects a correctly signed token whose `exp` claim is at or
before the current time.

**Affected Area**

`src/session.js` (`verifySession`, a new expiry error).

**Expected Outcome**

A signed token with a past `exp` throws an expiry error with the message
`session expired`; tokens without `exp` verify as before.

**Self-Check**

Planned: `node --test test/session.test.js test/handlers.test.js` in the
repository root, plus a targeted `node --input-type=module -e` call of
`verifySession` on a token signed with a past `exp`.

### DEV-002 — Account handler reports expired sessions

`Status`: `PENDING` `Depends On`: `DEV-001`
`Acceptance`: `EXPEDITED_REQUEST`

**Goal**

`getAccount` passes the current time to `verifySession` and tells the client
when its session has expired.

**Affected Area**

`src/handlers.js` (`getAccount`).

**Expected Outcome**

An expired token yields status 401 with the error `session expired`; valid
sessions keep their 200 and 404 responses.

**Self-Check**

Planned: the same test command, plus a targeted `getAccount` call with an
expired token.

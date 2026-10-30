<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: expired-sessions-20260924T090000Z-3c9e51a7
-->

# Development Plan

`Cycle`: `expired-sessions-20260924T090000Z-3c9e51a7` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true`
`Status`: `COMPLETE` `Verification Cadence`:
`AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `NONE`
- `Architecture`: `NONE`
- `Request`: `Reject expired session tokens on GET /accounts/:id with 401 and tell the client the session expired so it can refresh.`

## Build Steps

### DEV-001 — Expired session tokens fail verification

`Status`: `DONE` `Depends On`: `NONE`
`Acceptance`: `EXPEDITED_REQUEST`

**Goal**

`verifySession` rejects a correctly signed token whose `exp` claim is at or
before the current time.

**Affected Area**

`src/session.js` (`verifySession`, new `SessionExpired` error).

**Expected Outcome**

A signed token with a past `exp` throws `SessionExpired` with the message
`session expired`; tokens without `exp` verify as before.

**Self-Check**

`node --test test/session.test.js test/handlers.test.js` in the repository
root on the working tree with DEV-001 applied: exit 0, 5 passed, 0 failed.
Targeted check with `node --input-type=module -e`, signing a token with
`exp` set to 1 and calling `verifySession`: threw `SessionExpired`.
Limitation: the existing tests do not cover expired tokens.

### DEV-002 — Account handler reports expired sessions

`Status`: `DONE` `Depends On`: `DEV-001`
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

`node --test test/session.test.js test/handlers.test.js` in the repository
root on the working tree with DEV-001 and DEV-002 applied: exit 0, 5 passed,
0 failed. Targeted `node --input-type=module -e` call of `getAccount` with a
token signed with `exp` set to 1: status 401, error `session expired`.

**Implementation Notes**

`getAccount` takes an optional `now` function (default `Date.now`) so callers
can pin the clock.

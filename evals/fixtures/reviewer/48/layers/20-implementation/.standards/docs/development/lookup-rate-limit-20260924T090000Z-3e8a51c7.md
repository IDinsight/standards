<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: lookup-rate-limit-20260924T090000Z-3e8a51c7
-->

# Development Plan

`Cycle`: `lookup-rate-limit-20260924T090000Z-3e8a51c7` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true` `Status`: `COMPLETE`
`Verification Cadence`: `AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- Scope: `.standards/docs/scope/lookup-rate-limit-20260924T090000Z-3e8a51c7.md`
- Architecture:
  `.standards/docs/specs/lookup-rate-limit-20260924T090000Z-3e8a51c7.md`
- Request: limit each lookup client to 60 requests per minute, answering excess
  requests with 429 and Retry-After.

## Build Steps

### DEV-001 — In-memory per-client rate limiter

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `AC-001, AC-002, AC-003`

**Goal**

Provide the fixed-window limiter defined in the design's Interfaces and
Contracts.

**Affected Area**

`src/rateLimiter.js` (new).

**Expected Outcome**

`createRateLimiter` allows 60 requests per client per 60000 ms window, denies
later requests in the window with a rounded-up `retryAfterSeconds` of at least
1, keys windows by client id, and counts a missing client id under one shared
key.

**Self-Check**

Ran an ad-hoc module check in the project root with
`node --input-type=module -e` importing `createRateLimiter` with a fixed clock:
60 calls for one client were allowed, the 61st was denied with
`retryAfterSeconds` 60, and a second client was still allowed. Assessed content:
working tree on top of ${COMMIT:Record scope and design for lookup rate limiting}
with `src/rateLimiter.js` added; exit 0. Limitation: ad-hoc implementation
feedback, not formal verification.

### DEV-002 — Enforce the limit in the lookup handler and app

`Status`: `DONE` `Depends On`: `DEV-001` `Acceptance`: `AC-001, AC-002, AC-003`

**Goal**

Consult the limiter before the existing lookup and wire it into the production
path.

**Affected Area**

`src/handler.js` and `src/app.js` (modified together, as the design's build plan
requires).

**Expected Outcome**

Denied requests get status 429, a `Retry-After` header, and
`{ error: 'too many requests' }`; allowed requests and calls without a limiter
behave as before; `createApp` always creates the limiter.

**Self-Check**

`node --test test/directory.test.js test/handler.test.js` in the project root on
the working tree on top of
${COMMIT:Record scope and design for lookup rate limiting} with DEV-001 and
DEV-002 applied: exit 0, tests 5, pass 5, fail 0. This confirms existing lookups
behave as before without a limiter; the 429 path was checked by reading the code
and by the DEV-001 module check, not by a test.

## Plan Notes

- The user approved the plan as proposed; there were no deviations during
  implementation.
- Project references loaded: NONE.

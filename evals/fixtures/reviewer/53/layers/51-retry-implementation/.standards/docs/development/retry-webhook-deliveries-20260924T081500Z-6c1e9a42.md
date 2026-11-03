<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: retry-webhook-deliveries-20260924T081500Z-6c1e9a42
-->

# Development Plan

`Cycle`: `retry-webhook-deliveries-20260924T081500Z-6c1e9a42` `Mode`:
`AUTONOMOUS` `User Style`: `NONE` `User Style Locked`: `true` `Status`:
`COMPLETE` `Verification Cadence`: `AFTER_IMPLEMENTATION` `Current Increment`:
`NONE`

## Implementation Contract

- `Scope`:
  `.standards/docs/scope/retry-webhook-deliveries-20260924T081500Z-6c1e9a42.md`
- `Architecture`:
  `.standards/docs/specs/retry-webhook-deliveries-20260924T081500Z-6c1e9a42.md`
- `Request`: `Retry failed webhook deliveries with capped exponential backoff.`

## Build Steps

### DEV-001 — Backoff helper and retry defaults

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `AC-002, AC-004`

**Goal**

Provide the delay formula and the default retry settings from the design.

**Affected Area**

`src/backoff.js` (CREATE), `src/config.js` (CREATE).

**Expected Outcome**

`backoffDelay(n, settings)` returns `min(base * 2^(n - 1), max)`, and
`retryDefaults` holds 3 attempts, 500 ms base, 8000 ms maximum.

**Self-Check**

In the project root, on the files as committed with this plan:
`node -e "import('./src/backoff.js').then(({ backoffDelay }) => console.log([1, 2, 3, 4, 5, 6].map((n) => backoffDelay(n, { baseDelayMs: 500, maxDelayMs: 8000 }))))"`
printed `[ 500, 1000, 2000, 4000, 8000, 8000 ]`. `npm test`: exit 0, 3 passed.

### DEV-002 — Retry loop in deliver

`Status`: `DONE` `Depends On`: `DEV-001` `Acceptance`:
`AC-001, AC-002, AC-003, AC-004`

**Goal**

Retry network errors and 5xx responses with the backoff delays, stop on any
other result, and accept per-call overrides.

**Affected Area**

`src/deliver.js` (MODIFY).

**Expected Outcome**

`deliver(send, payload, options)` loops up to `maxAttempts`, reports the
attempts made, and keeps the existing result fields.

**Self-Check**

In the project root, on the files as committed with this plan: `npm test`:
exit 0, 3 passed (existing 2xx and 404 cases unchanged). Manual run with a
transport answering 503, 503, 200 and a recording `wait`: result
`{ delivered: true, attempts: 3, status: 200, error: null }`, waits
`[500, 1000]`. Limitation: no retry tests exist yet; Tester owns them.

## Plan Notes

- Project references loaded: NONE.

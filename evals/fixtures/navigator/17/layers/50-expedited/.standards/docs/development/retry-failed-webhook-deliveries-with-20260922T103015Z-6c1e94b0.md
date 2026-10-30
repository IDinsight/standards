<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: retry-failed-webhook-deliveries-with-20260922T103015Z-6c1e94b0
-->

# Development Plan

`Cycle`: `retry-failed-webhook-deliveries-with-20260922T103015Z-6c1e94b0` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true`
`Status`: `COMPLETE` `Verification Cadence`:
`AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `NONE`
- `Architecture`: `NONE`
- `Request`: `Retry failed webhook deliveries with backoff.`

## Build Steps

### DEV-001 — Retry deliveries on server and network errors

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `EXPEDITED_REQUEST`

**Goal**

Retry a delivery that fails with a network error or a 5xx response, waiting
longer before each retry.

**Affected Area**

`src/deliver.js`

**Expected Outcome**

`deliver()` makes up to four attempts with 500, 2000, and 8000 ms waits between
them, stops at the first response below 500, and reports `attempts` in its
result. Callers can pass `sleep` and `delays`.

**Self-Check**

- `node --test test/deliver.test.js` in the project root on the uncommitted
  change: exit 0, 4 passed.
- One-off script in the project root with a stubbed `send` returning 503, 503,
  then 200 and a no-op `sleep`: result `{ delivered: true, status: 200, attempts: 3 }`.
  The script was not kept.

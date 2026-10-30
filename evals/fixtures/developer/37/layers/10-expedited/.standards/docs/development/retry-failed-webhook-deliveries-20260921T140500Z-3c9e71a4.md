<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: retry-failed-webhook-deliveries-20260921T140500Z-3c9e71a4
-->

# Development Plan

`Cycle`: `retry-failed-webhook-deliveries-20260921T140500Z-3c9e71a4` `Mode`: `AUTONOMOUS`
`User Style`: `tony` `User Style Locked`: `true`
`Status`: `IN_PROGRESS` `Verification Cadence`:
`AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `NONE`
- `Architecture`: `NONE`
- `Request`: `Retry failed webhook deliveries instead of dropping them after one attempt.`

## Build Steps

### DEV-001 — Retry loop for server errors and network failures

`Status`: `DONE` `Depends On`: `NONE`
`Acceptance`: `EXPEDITED_REQUEST`

**Goal**

Attempt a delivery up to 3 times when the subscriber answers 5xx or the request
fails, reusing the same body and signature, and report the attempt count.

**Affected Area**

`src/webhook.js` (`deliver`).

**Expected Outcome**

`deliver` makes at most 3 `fetchImpl` calls, stops on any response it does not
retry, and returns `{ ok, status, attempts }`, with `error` added for network
failures.

**Self-Check**

- `npm test` in the project root on the working tree with this change, before
  commit: exit 0, 5 tests passed, 0 failed.
- `node --input-type=module -e` sanity script with a fake `fetchImpl` returning
  503 every time: 3 calls, result `{ ok: false, status: 503, attempts: 3 }`;
  with 404: 1 call.

**Implementation Notes**

Body and headers are computed once before the loop so every attempt carries the
same signature.

### DEV-002 — Delay between attempts

`Status`: `PENDING` `Depends On`: `DEV-001`
`Acceptance`: `EXPEDITED_REQUEST`

**Goal**

Wait a fixed 1 second between attempts so retries do not hit the subscriber
back to back.

**Affected Area**

`src/webhook.js` (`deliver`).

**Expected Outcome**

After a retryable failure, `deliver` waits 1 second before the next attempt.

**Self-Check**

`npm test` in the project root, then the fake-fetch sanity script with timing.
Not yet run.

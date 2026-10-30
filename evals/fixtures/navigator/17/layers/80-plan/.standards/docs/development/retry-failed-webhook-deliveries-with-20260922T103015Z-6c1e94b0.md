<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: retry-failed-webhook-deliveries-with-20260922T103015Z-6c1e94b0
-->

# Development Plan

`Cycle`: `retry-failed-webhook-deliveries-with-20260922T103015Z-6c1e94b0` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true`
`Status`: `IN_PROGRESS` `Verification Cadence`:
`AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/retry-failed-webhook-deliveries-with-20260922T103015Z-6c1e94b0.md`
- `Architecture`: `.standards/docs/specs/retry-failed-webhook-deliveries-with-20260922T103015Z-6c1e94b0.md`
- `Request`: `Retry failed webhook deliveries with backoff.`

## Build Steps

### DEV-001 — Retry deliveries on server and network errors

`Status`: `DONE` `Depends On`: `NONE`
`Acceptance`: `AC-001, AC-002, AC-003`

**Goal**

Retry a delivery that fails with a network error or a 5xx response, waiting
longer before each retry, and report the number of attempts.

**Affected Area**

`src/deliver.js`

**Expected Outcome**

`deliver()` makes up to four attempts with 500, 2000, and 8000 ms waits between
them, stops at the first response below 500, and reports `attempts`. Callers
can pass `sleep` and `delays`; both are optional.

**Self-Check**

- `node --test test/deliver.test.js` in the project root at commit
  ${COMMIT:Retry failed webhook deliveries with backoff}: exit 0, 4 passed.
- One-off script with a stubbed `send` returning 503, 503, then 200 and a no-op
  `sleep`: result `{ delivered: true, status: 200, attempts: 3 }`.
- Rechecked against the design after promotion: the loop matches the
  Interfaces and Contracts section; no change needed.

**Implementation Notes**

Implemented on the former expedited path; still tentative work of this cycle
per `.standards/CONTEXT.md`.

### DEV-002 — Same delivery identifier on every attempt

`Status`: `IN_PROGRESS` `Depends On`: `DEV-001` `Acceptance`: `AC-004`

**Goal**

Send an `Idempotency-Key` header whose value is the same on every attempt of
one delivery. This is the correction for Outstanding Obligation 1, from
`.standards/docs/reviews/retry-failed-webhook-deliveries-with-20260922T103015Z-6c1e94b0/implementation.md#F-001`.

**Affected Area**

`src/deliver.js` request construction.

**Expected Outcome**

Every request made by one `deliver()` call carries `Idempotency-Key` with one
unchanging value; body and `content-type` unchanged.

**Self-Check**

Not yet run. Planned: `node --test test/deliver.test.js` in the project root,
plus a stubbed `send` that fails twice to compare the headers of all attempts.

**Implementation Notes**

Paused before editing `src/deliver.js`; see Plan Notes.

## Plan Notes

- Reconciled after promotion: replaced `EXPEDITED_REQUEST` with the current
  acceptance identifiers, kept DEV-001, and added DEV-002 for Outstanding
  Obligation 1. The user approved the revised plan before DEV-002 started.
- `test/deliver.test.js` asserts the exact request header set, so adding the
  header would break an existing scenario. That test belongs to Tester; the
  change was routed to Tester instead of editing the test here.

### Suspended Assignment 1

`Recovery Frame`: `1` `Recovery Reason`: `test/deliver.test.js asserts the exact request header set, so DEV-002 cannot add the delivery identifier header without a Tester-owned test change.`
`Purpose`: `DEVELOPMENT` `Target`: `NONE`
`Assessed Inputs`: `src/deliver.js and test/deliver.test.js at commit ${COMMIT:Retry failed webhook deliveries with backoff}`
`Next Action`: `Implement DEV-002 against the corrected header test, run node --test test/deliver.test.js, then verify and clear Outstanding Obligation 1.`

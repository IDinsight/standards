<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: retry-failed-webhook-deliveries-20260921T140500Z-3c9e71a4
-->

# Development Plan

`Cycle`: `retry-failed-webhook-deliveries-20260921T140500Z-3c9e71a4` `Mode`: `AUTONOMOUS`
`User Style`: `tony` `User Style Locked`: `true`
`Status`: `PROPOSED` `Verification Cadence`:
`AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/retry-failed-webhook-deliveries-20260921T140500Z-3c9e71a4.md`
- `Architecture`: `.standards/docs/specs/retry-failed-webhook-deliveries-20260921T140500Z-3c9e71a4.md`
- `Request`: `Retry failed webhook deliveries instead of dropping them after one attempt.`

## Build Steps

### DEV-001 — Retry loop for server errors and network failures

`Status`: `DONE` `Depends On`: `NONE`
`Acceptance`: `AC-001, AC-004`

**Goal**

Attempt a delivery up to 3 times when the subscriber answers 5xx or the request
fails, reusing the same body and signature, and report the attempt count.

**Affected Area**

`src/webhook.js` (`deliver`).

**Expected Outcome**

`deliver` makes at most 3 `fetchImpl` calls, stops on any response it does not
retry, and returns `{ ok, status, attempts }`, with `error` added for network
failures. Other 4xx responses return after one attempt.

**Self-Check**

- `npm test` in the project root on the working tree later committed as
  `${COMMIT:Retry webhook deliveries on server errors}`: exit 0, 5 tests
  passed, 0 failed.
- `node --input-type=module -e` sanity script with a fake `fetchImpl` returning
  503 every time: 3 calls, result `{ ok: false, status: 503, attempts: 3 }`;
  with 404: 1 call.
- Limitation: no automated tests cover retries yet; formal verification belongs
  to Tester.

**Implementation Notes**

Body and headers are computed once before the loop so every attempt carries the
same signature.

### DEV-002 — Backoff and Retry-After between attempts

`Status`: `PENDING` `Depends On`: `DEV-001`
`Acceptance`: `AC-002, AC-003`

**Goal**

Wait between attempts as the technical design specifies: exponential backoff
from 1 s capped at 30 s, `Retry-After` honored for 429, and 429 treated as
retryable.

**Affected Area**

`src/webhook.js` (`deliver` options and retry classification).

**Expected Outcome**

- 429 responses are retried; other 4xx responses still return after one attempt.
- Without an applicable `Retry-After`, `deliver` calls `sleep(1000)` before
  attempt 2 and `sleep(2000)` before attempt 3, and never sleeps after the last
  attempt.
- For a 429 whose `Retry-After` is an integer number of seconds, the wait is the
  larger of the backoff and that value; when it would exceed 30 s, `deliver`
  returns the 429 result without retrying.
- `deliver` accepts an optional `sleep(ms)` and defaults to a
  `setTimeout`-based promise; existing callers and `dispatch` are unchanged.

**Self-Check**

`npm test` in the project root, then a `node --input-type=module -e` sanity
script with a fake `fetchImpl` and a recording `sleep` for 503, 429 with
`Retry-After: 5`, 429 with `Retry-After: 120`, and 404. Not yet run.

## Plan Notes

- Promotion reconciliation after the standard scope and design were completed:
  the Implementation Contract now names the standard scope and design, and the
  former `EXPEDITED_REQUEST` mappings are replaced by AC-001 to AC-004.
- DEV-001 stays `DONE`: its outcome already provides the retry classification
  for 5xx and network errors and the attempt count the design requires.
- DEV-002 previously planned a fixed 1-second wait between attempts. The design
  replaces that with capped exponential backoff, `Retry-After` handling for 429,
  and an injectable `sleep`, which changes the step's behavior and technical
  approach. The plan is back to `PROPOSED` and needs approval before DEV-002 is
  implemented.

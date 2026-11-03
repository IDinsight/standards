<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: retry-failed-webhook-deliveries-20260921T140500Z-3c9e71a4
-->

# Technical Design

## Context

The cycle was promoted from an expedited change. A retry loop for 5xx responses
and network errors already exists in `src/webhook.js` from that path (see the
Active-Cycle Non-Baseline Work entry in `.standards/CONTEXT.md`). Waiting
between attempts and the handling of 429 needed a design decision.

## Decision

- Retry classification stays in `src/webhook.js`: retry on network errors, 5xx,
  and 429; return immediately for every other status.
- The wait before attempt n+1 is min(30 s, 1 s × 2^(n−1)): 1 s, then 2 s under
  the 3-attempt limit.
- For a 429 whose `Retry-After` header is a non-negative integer number of
  seconds, the wait is max(backoff, Retry-After). If that exceeds 30 s, return
  the 429 result without retrying. HTTP-date values are ignored and the backoff
  applies.
- Waiting goes through an injectable `sleep(ms)` option on `deliver`, defaulting
  to a `setTimeout`-based promise, so callers and tests control time.

## Acceptance Coverage

- `AC-001`: retry classification for 5xx and network errors and the 3-attempt
  loop; body and headers computed once before the loop.
- `AC-002`: 429 classified as retryable; `Retry-After` parsing and the 30 s
  refusal rule.
- `AC-003`: exponential backoff schedule capped at 30 s, applied through
  `sleep`.
- `AC-004`: other 4xx statuses return after one attempt; result
  `{ ok, status, attempts }`, plus `error` for network failures.

## Interfaces and Contracts

- `deliver(endpoint, event, { fetchImpl = fetch, sleep = defaultSleep } = {})`
  returns `Promise<{ ok, status, attempts, error? }>`.
- `Retry-After` is read with `response.headers.get('retry-after')` only for a
  429 and only when `response.headers` exists; existing fake responses without
  headers keep working.
- `dispatch` passes its options through unchanged, so `sleep` reaches `deliver`.

## Technical Acceptance Criteria

- `AC-002`: a 429 with `Retry-After: 5` produces a `sleep` of at least 5000 ms
  before the next attempt; `Retry-After: 120` produces no retry.
- `AC-003`: without an applicable `Retry-After`, the sleeps between 3 attempts
  are 1000 ms then 2000 ms; no sleep follows the last attempt.
- `AC-004`: `attempts` equals the number of `fetchImpl` calls.

## Build Plan

1. Keep the existing retry loop; extend classification to 429.
2. Add the backoff schedule, `Retry-After` handling, and the injectable `sleep`.

## Alternatives

- Fixed 1 s wait between attempts: rejected; it does not grow between retries
  and ignores `Retry-After`.

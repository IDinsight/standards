<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: retry-webhook-deliveries-20260924T081500Z-6c1e9a42
-->

# Technical Design

## Context

`deliver` in `src/deliver.js` makes a single attempt through the
caller-supplied `send` (see `.standards/CONTEXT.md`). The scope adds retries
for transient failures with capped exponential backoff and defaults that need
no configuration.

## Decision

Keep the retry loop inside `deliver`. Compute delays in a pure helper and keep
defaults in a frozen settings object. Tests control time through an injectable
`wait(ms)` option, so no real timers run in the suite.

## Acceptance Coverage

- `AC-001`: Retry loop in `deliver`; `isRetryable` treats a rejected `send`
  and any status of 500 or above as retryable; `attempts` reports the attempts
  made.
- `AC-002`: `backoffDelay(attempt, settings)` in `src/backoff.js`; `deliver`
  waits `backoffDelay(n)` only between attempt n and attempt n + 1.
- `AC-003`: `isRetryable` is false for every response status below 500, and
  the loop stops at the first non-retryable result.
- `AC-004`: `retryDefaults` in `src/config.js`; per-call options are spread
  over the defaults.

## Interfaces and Contracts

- `deliver(send, payload, options?)` resolves to
  `{ delivered, attempts, status, error }`. `options` may set `maxAttempts`,
  `baseDelayMs`, `maxDelayMs`, and `wait`.
- `backoffDelay(attempt, { baseDelayMs, maxDelayMs })` returns
  `min(baseDelayMs * 2^(attempt - 1), maxDelayMs)`; `attempt` is 1-based.
- `wait(ms)` defaults to a promise around `setTimeout`.

## Technical Acceptance Criteria

- `AC-001`, `AC-002`: A wait happens only before another attempt; no wait
  follows the final attempt, whether it succeeded, was not retryable, or
  reached `maxAttempts`.
- `AC-002`: The wait after attempt n is
  `min(baseDelayMs * 2^(n - 1), maxDelayMs)`.
- `AC-004`: `retryDefaults` is
  `{ maxAttempts: 3, baseDelayMs: 500, maxDelayMs: 8000 }`.

## Build Plan

1. CREATE `src/config.js` and `src/backoff.js`.
2. MODIFY `src/deliver.js` to loop over attempts using both.

## Risks and Follow-up

- Real waits can add several seconds per payload; bulk callers should deliver
  concurrently. Not addressed in this cycle.

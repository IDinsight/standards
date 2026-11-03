<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: retry-failed-webhook-deliveries-with-20260921T140512Z-5c81e0a4
-->

# Technical Design

## Context

`deliver()` in `src/deliver.js` makes one call to the injected `send` and maps
the answer to `{ ok, attempts, status }`; `src/http.js` rejects on timeout or
network error. Settings come from `loadConfig()` in `src/config.js`, which
validates integers and names the variable in its error (`.standards/CONTEXT.md`).

## Decision

Put the retry loop inside `deliver()` so `relayBatch()` and the dispatcher keep
their contract. Classify by status, treating a rejected `send` (status 0) as
retryable. Compute waits with a pure `backoffDelay()` and wait through an
injectable `sleep` so tests do not wait. Add three settings to `loadConfig()`
using the existing `readInt()` validation.

## Acceptance Coverage

- `AC-001`: retry loop in `deliver()`; retryable classification (status 0, 429, 500 and above); `attempts` in the result is the number of `send` calls.
- `AC-002`: the same classification treats every other non-2xx status as final on the first attempt.
- `AC-003`: `backoffDelay(attempt, config)`, applied after each failed attempt that will be retried.
- `AC-004`: `RELAY_MAX_ATTEMPTS`, `RELAY_BACKOFF_MS`, and `RELAY_MAX_BACKOFF_MS` in `loadConfig()`.
- `AC-005`: No architectural impact — Documenter updates `docs/operations.md`.

## Interfaces and Contracts

- `deliver(event, { send, config, sleep })`: `sleep(ms)` defaults to a
  `setTimeout` promise. Returns `{ ok, attempts, status }`, plus `error` when
  the last attempt threw.
- `backoffDelay(attempt, config)` = `min(backoffMs * 2^(attempt - 1), maxBackoffMs)`,
  where `attempt` is the 1-based attempt that just failed.
- Settings (integers): `RELAY_MAX_ATTEMPTS` default 3, minimum 1 (1 turns
  retries off); `RELAY_BACKOFF_MS` default 500, minimum 0;
  `RELAY_MAX_BACKOFF_MS` default 8000, minimum 0.

## Technical Acceptance Criteria

- `AC-001`: `send` is called at most `maxAttempts` times per event; a 2xx on any attempt returns `ok: true` with that attempt number.
- `AC-002`: a 4xx other than 429 returns after exactly one `send` call and no `sleep`.
- `AC-003`: with base 500 and maximum 8000 the waits are 500, 1000, 2000, 4000, 8000, 8000, and so on.
- `AC-004`: `loadConfig({})` returns the defaults; a non-integer or below-minimum value throws an error whose message contains the variable name.

## Build Plan

1. Add the settings to `loadConfig()`.
2. Add classification, `backoffDelay()`, and the loop in `deliver()`.

## Risks and Follow-up

- Retries lengthen a batch: with defaults an event that keeps failing adds
  1.5 s of waiting. Acceptable for current batch sizes.

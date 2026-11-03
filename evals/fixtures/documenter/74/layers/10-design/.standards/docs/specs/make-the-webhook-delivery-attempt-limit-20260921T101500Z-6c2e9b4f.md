<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: make-the-webhook-delivery-attempt-limit-20260921T101500Z-6c2e9b4f
-->

# Technical Design

## Context

`loadConfig` (`src/config.js`) reads environment settings when `createWorker`
(`src/worker.js`) is called; `deliver` (`src/delivery.js`) uses a fixed
`MAX_ATTEMPTS = 5`. See `.standards/CONTEXT.md`.

## Decision

Parse `WEBHOOK_MAX_ATTEMPTS` in `loadConfig` and pass the result to `deliver`
as a `maxAttempts` option, removing the constant. A parse failure throws from
`loadConfig`, so `createWorker` fails before any delivery. This follows the
existing `WEBHOOK_BACKOFF_MS` pattern.

## Acceptance Coverage

- `AC-001`: `loadConfig` returns `maxAttempts: 3` when the variable is unset or
  empty; `deliver` makes at most `maxAttempts` calls to `send`.
- `AC-002`: `loadConfig` accepts a string of decimal digits whose value is 1 to
  10 and returns it as a number.
- `AC-003`: `loadConfig` throws an `Error` whose message contains
  `WEBHOOK_MAX_ATTEMPTS` for any other value; `createWorker` does not catch it.

## Interfaces and Contracts

- `loadConfig(env)` returns `{ endpoint, backoffMs, maxAttempts }`.
- `deliver(event, { send, sleep, maxAttempts, backoffMs })` keeps its result
  shape `{ delivered, attempts, error? }`.

## Technical Acceptance Criteria

- `AC-001`, `AC-002`: `deliver` stops after `maxAttempts` failed calls, waiting
  `backoffMs * 2^(n-1)` after failure n when another attempt remains.
- `AC-003`: the error is raised synchronously from `createWorker`.

## Build Plan

1. MODIFY `src/config.js`: add parsing and the default.
2. MODIFY `src/delivery.js` and `src/worker.js`: take the limit as an option and
   pass it from configuration.

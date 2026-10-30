<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: retry-failed-webhook-deliveries-with-20260922T103015Z-6c1e94b0
-->

# Technical Design

## Context

`src/deliver.js` exports `deliver(event, endpoint, { send })`. A retry loop is
already in the repository from the former expedited path; it is tentative work
of this cycle (see `.standards/CONTEXT.md`) and is reconciled with this design.

## Decision

Keep retries inside `deliver()`: attempt, classify the result, wait, repeat.
Inject `sleep` and `delays` so callers control timing. Mark attempts with an
`Idempotency-Key` request header, the name most webhook receivers already
recognize; receivers that ignore it are unaffected.

## Acceptance Coverage

- `AC-001`: retry loop in `deliver()` with default waits of 500, 2000, and
  8000 ms; rejected `send` calls and 5xx responses are retryable.
- `AC-002`: any response below 500 ends the loop immediately.
- `AC-003`: the result object gains `attempts`.
- `AC-004`: `Idempotency-Key` request header on every attempt.

## Interfaces and Contracts

- `deliver(event, endpoint, { send, sleep, delays })` resolves to
  `{ delivered, status, attempts }` or `{ delivered: false, error, attempts }`.
  `sleep(ms)` returns a promise and defaults to a timer; `delays` defaults to
  `[500, 2000, 8000]`. All new options are optional.
- Request headers: `content-type: application/json` and `Idempotency-Key`. The
  `Idempotency-Key` value is identical on every attempt of one delivery.
- Request body is unchanged: `{ type, data, sentAt }`.

## Technical Acceptance Criteria

- `AC-001`: after two retryable failures and a 200, `sleep` was awaited with 500
  and then 2000, and the result reports 3 attempts.
- `AC-002`: a 4xx response produces exactly one `send` call and no `sleep`.
- `AC-003`: `attempts` equals the number of `send` calls made.
- `AC-004`: all requests made for one delivery carry the same `Idempotency-Key`
  value.

## Build Plan

1. Reconcile the existing retry loop with this design.
2. Add the `Idempotency-Key` header.

## Risks and Follow-up

- Receivers that ignore `Idempotency-Key` still see repeated attempts; the
  header only makes discarding them possible.

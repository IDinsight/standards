<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: validate-outgoing-messages-and-retry-20260922T141500Z-3c9e51ab
-->

# Technical Design

## Context

`src/send.js` exports `sendMessage(transport, message)`, which calls
`transport.send(message)` once and throws a plain `Error` for any status of 300
or above. See `.standards/CONTEXT.md`.

## Decision

Add a pure `validateMessage(message)` module that returns a list of error
strings, and make `sendMessage` validate first and then run a bounded retry
loop with exponential backoff. Delays go through an injectable `sleep` option
so callers and tests can avoid real waiting.

## Acceptance Coverage

- `AC-001`, `AC-002`: `validateMessage` in `src/validate.js`; `sendMessage` throws `InvalidMessageError` carrying the full list before any transport call.
- `AC-003`: retry loop in `sendMessage` over the transient status set, with `maxAttempts` and `baseDelayMs` options.
- `AC-004`: `SendError` with `status` and `attempts`, thrown immediately for non-transient statuses and after the last transient failure.

## Interfaces and Contracts

- `validateMessage(message)` returns an array of strings, empty when valid. Errors, in order: `to must be an email address`, then `subject is required` or `subject must be at most 120 characters`, then `body must be a string`. A non-object returns only `message must be an object`.
- `sendMessage(transport, message, options)`: `options` is optional with `maxAttempts` (default 3, total attempts including the first), `baseDelayMs` (default 200), and `sleep(ms)` (default based on `setTimeout`).
- `InvalidMessageError`: `errors` holds the list from `validateMessage`.
- `SendError`: `status` is the last status received; `attempts` is the number of transport calls made.
- Transient statuses: 429, 502, 503, 504.

## Data and Control Flow

Validate; if there are errors, throw `InvalidMessageError`. Otherwise call the
transport. A status below 300 returns the response. A non-transient status
throws `SendError` at once. A transient status waits `baseDelayMs * 2^(n-1)`
after the n-th failed attempt and tries again, until `maxAttempts` calls have
been made; then it throws `SendError`.

## Technical Acceptance Criteria

- `AC-001`: no transport call occurs when `validateMessage` returns any error.
- `AC-002`: `InvalidMessageError.errors` equals the full `validateMessage` result.
- `AC-003`: with defaults, at most 3 transport calls, with delays of 200 ms and then 400 ms between them.
- `AC-004`: `SendError.attempts` equals the number of transport calls made.

## Build Plan

1. Add `src/validate.js`.
2. Rework `sendMessage` with validation, the retry loop, and the two error types.

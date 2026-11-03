# Project Context

## Project Baseline

- `hookrelay` sends signed JSON webhook events to subscriber endpoints. Baseline
  delivery (`deliver` in `src/webhook.js` before this cycle) makes one POST
  attempt and reports `{ ok, status }`.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no runtime or
  development dependencies.

## Structure and Boundaries

- `src/signing.js` — HMAC-SHA256 signing and verification; header
  `x-hookrelay-signature`.
- `src/webhook.js` — single-endpoint delivery; takes an injectable `fetchImpl`.
- `src/dispatch.js` — sends one event to each endpoint in order and collects
  results; passes options through to `deliver`.

## Commands

- `npm test` — runs `node --test test/webhook.test.js test/signing.test.js`.

## Testing and Verification Baseline

- `node:test` with fake `fetchImpl` functions; tests make no network calls.
- No tests cover retries or waiting between attempts.

## Relevant Existing Behavior

- Every request carries `content-type: application/json` and the signature of
  the exact body sent.

## Active-Cycle Non-Baseline Work

- `Cycle: retry-failed-webhook-deliveries-20260921T140500Z-3c9e71a4; src/webhook.js retry loop` —
  the up-to-3-attempt loop and the `attempts` result field were added on the
  expedited path of this cycle and are not established baseline.

## Evidence

- `src/webhook.js`, `src/dispatch.js`, `test/webhook.test.js` — inspected at
  the initial project commit and at the current commit.
- `npm test` — exit 0, 5 tests passed.

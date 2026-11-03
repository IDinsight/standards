<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: make-the-webhook-delivery-attempt-limit-20260921T101500Z-6c2e9b4f
-->

# Development Plan

`Cycle`: `make-the-webhook-delivery-attempt-limit-20260921T101500Z-6c2e9b4f` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true` `Status`: `COMPLETE`
`Verification Cadence`: `AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/make-the-webhook-delivery-attempt-limit-20260921T101500Z-6c2e9b4f.md`
- `Architecture`: `.standards/docs/specs/make-the-webhook-delivery-attempt-limit-20260921T101500Z-6c2e9b4f.md`
- `Request`: `Configurable webhook delivery attempt limit through WEBHOOK_MAX_ATTEMPTS.`

## Build Steps

### DEV-001 — Parse WEBHOOK_MAX_ATTEMPTS in loadConfig

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `AC-001, AC-002, AC-003`

**Goal**

`loadConfig` returns a validated `maxAttempts` with default 3.

**Affected Area**

`src/config.js`

**Expected Outcome**

Unset or empty gives 3; digit strings 1 to 10 are accepted; anything else
throws an error naming `WEBHOOK_MAX_ATTEMPTS`.

**Self-Check**

In the project root, a `node --input-type=module -e` script called `loadConfig`
with unset, empty, 1, 10, 0, 11, and x: printed 3, 3, 1, 10, then three errors
beginning with the variable name. Exit 0. Assessed content: working tree before
the implementation commit.

### DEV-002 — Use the configured limit in delivery

`Status`: `DONE` `Depends On`: `DEV-001` `Acceptance`: `AC-001, AC-002, AC-003`

**Goal**

`deliver` takes the limit as an option and `createWorker` passes it from
configuration; the constant is removed.

**Affected Area**

`src/delivery.js`, `src/worker.js`

**Expected Outcome**

A worker created with default settings attempts a failing event 3 times; worker
creation throws for an invalid limit.

**Self-Check**

`npm test` in the project root: exit 1, 2 of 4 tests fail. Both failing tests
(default configuration shape and the five-attempt delivery test) assert the
pre-cycle behavior that AC-001 changes; left for Tester. Manual script with a
failing `send` and default env: 3 attempts, waits 500 and 1000.

## Plan Notes

Project references loaded: NONE.

<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: retry-failed-webhook-deliveries-with-20260921T140512Z-5c81e0a4
-->

# Development Plan

`Cycle`: `retry-failed-webhook-deliveries-with-20260921T140512Z-5c81e0a4` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true` `Status`: `COMPLETE`
`Verification Cadence`: `AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/retry-failed-webhook-deliveries-with-20260921T140512Z-5c81e0a4.md`
- `Architecture`: `.standards/docs/specs/retry-failed-webhook-deliveries-with-20260921T140512Z-5c81e0a4.md`
- `Request`: `Retry failed webhook deliveries with configurable exponential backoff and document the settings for operators.`

## Build Steps

### DEV-001 — Retry settings in loadConfig

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `AC-004`

**Goal**

Expose the three retry settings from the environment with the designed
defaults and validation.

**Affected Area**

`src/config.js`.

**Expected Outcome**

`loadConfig()` returns `maxAttempts`, `backoffMs`, and `maxBackoffMs` with
defaults 3, 500, and 8000, and rejects invalid values through `readInt()` with
the variable name in the message.

**Self-Check**

`node --test test/config.test.js test/deliver.test.js` in the project root on
the working tree with this step applied: exit 0, 5 passing. `node -e` importing
`src/config.js` and calling `loadConfig({ RELAY_MAX_ATTEMPTS: '0' })` exited 1
with `RELAY_MAX_ATTEMPTS must be an integer >= 1, got "0"`.

### DEV-002 — Retry loop and backoff in deliver

`Status`: `DONE` `Depends On`: `DEV-001` `Acceptance`: `AC-001, AC-002, AC-003`

**Goal**

Retry deliveries that may succeed later, with a doubling, capped wait.

**Affected Area**

`src/deliver.js`. `src/relay.js` and `src/http.js` need no change.

**Expected Outcome**

`deliver()` calls `send` up to `maxAttempts` times for status 0, 429, and 5xx,
returns at once for other non-2xx statuses, waits `backoffDelay()` between
attempts through an injectable `sleep`, and reports the attempts made.

**Self-Check**

Same command in the project root with both steps applied: exit 0, 5 passing.
A stubbed `send` answering 503, 503, 200 with a recording `sleep` returned
`{ ok: true, attempts: 3, status: 200 }` with waits 500 and 1000; a stub
answering 404 returned after one call with no wait.

## Plan Notes

- Both steps were self-checked on the working tree that became the commit
  that adds retry with backoff to webhook delivery. Formal tests for the new
  behavior are left to Tester.

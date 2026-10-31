<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: delivery-retry-limit-20260924T081500Z-6b1e9d4a
-->

# Development Plan

`Cycle`: `delivery-retry-limit-20260924T081500Z-6b1e9d4a` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true` `Status`: `COMPLETE`
`Verification Cadence`: `AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`:
  `.standards/docs/scope/delivery-retry-limit-20260924T081500Z-6b1e9d4a.md`
- `Architecture`:
  `.standards/docs/specs/delivery-retry-limit-20260924T081500Z-6b1e9d4a.md`
- `Request`:
  `Configurable retry limit, dead-letter file for exhausted deliveries, operations guide update.`

## Build Steps

### DEV-001 — Configurable retry limit

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `AC-001`

**Goal**

`RETRY_LIMIT` controls how many retries follow a failed first attempt.

**Affected Area**

`src/config.js`, `src/deliver.js`, `test/config.test.js`,
`test/deliver.test.js`.

**Expected Outcome**

`loadConfig` returns `retryLimit` (default 5, positive integer) and `deliver`
makes at most `retryLimit + 1` attempts with backoff capped at 30 seconds.

**Self-Check**

`node --test test/config.test.js test/deliver.test.js` in the repository root
on the working tree before commit: exit 0, 6 tests passed.

### DEV-002 — Dead-letter file for exhausted deliveries

`Status`: `DONE` `Depends On`: `DEV-001` `Acceptance`: `AC-003`

**Goal**

A delivery whose attempts are exhausted is kept in a JSON-lines file instead of
being discarded.

**Affected Area**

`src/deadLetter.js` (new), `src/deliver.js`, `bin/relay.js`.

**Expected Outcome**

After the last failed attempt the delivery is appended to `deadLetterPath` as
one JSON line with `id`, `event`, `error`, `attempts`, and `failedAt`, and
`deliver` resolves with status `dead-lettered`.

**Self-Check**

Same test command: exit 0, 6 tests passed. A `node -e` script calling
`appendDeadLetter` twice with a path under a new temporary folder created the
folder, and the file held two JSON lines.

## Plan Notes

- `AC-002` (operations guide) is Documenter-owned; it has no development step.
- Project references loaded: NONE.

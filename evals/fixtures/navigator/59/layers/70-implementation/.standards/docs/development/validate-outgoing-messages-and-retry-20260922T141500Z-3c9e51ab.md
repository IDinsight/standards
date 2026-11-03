<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: validate-outgoing-messages-and-retry-20260922T141500Z-3c9e51ab
-->

# Development Plan

`Cycle`: `validate-outgoing-messages-and-retry-20260922T141500Z-3c9e51ab` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true`
`Status`: `COMPLETE` `Verification Cadence`:
`AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/validate-outgoing-messages-and-retry-20260922T141500Z-3c9e51ab.md`
- `Architecture`: `.standards/docs/specs/validate-outgoing-messages-and-retry-20260922T141500Z-3c9e51ab.md`
- `Request`: `Validate outgoing messages and retry transient send failures.`

## Build Steps

### DEV-001 — Message validation module

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `AC-001, AC-002`

**Goal**

Add `validateMessage`, returning every problem found in a message.

**Affected Area**

`src/validate.js` (new).

**Expected Outcome**

`validateMessage` returns an empty array for a well-formed message and the
design's error strings, in design order, otherwise.

**Self-Check**

`node -e` importing `src/validate.js` from the project root, called with a
valid message and with `{ to: 'ada', subject: ' ', body: 1 }`, on the saved
working tree before commit: printed an empty array and the three expected
errors.

### DEV-002 — Validation and retry in sendMessage

`Status`: `DONE` `Depends On`: `DEV-001` `Acceptance`: `AC-001, AC-002, AC-003, AC-004`

**Goal**

Validate before sending and retry transient transport failures with
exponential backoff, raising `InvalidMessageError` or `SendError` as designed.

**Affected Area**

`src/send.js`.

**Expected Outcome**

Invalid messages never reach the transport; transient statuses are retried with
doubling delays up to `maxAttempts`; other failures throw `SendError` at once.
The existing two-argument call keeps working.

**Self-Check**

`npm test` in the project root on the saved working tree before commit: exit 0,
1 test passed (`test/send.test.js`). A `node -e` run with a transport answering
503 then 202 and a recording `sleep` returned status 202 after two calls with
one 200 ms delay.

## Plan Notes

The user approved the plan as proposed; both steps were implemented
autonomously in order.

<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: overdue-loan-digest-20260922T141500Z-6e2a9c41
-->

# Development Plan

`Cycle`: `overdue-loan-digest-20260922T141500Z-6e2a9c41` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true` `Status`: `COMPLETE`
`Verification Cadence`: `AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`:
  `.standards/docs/scope/overdue-loan-digest-20260922T141500Z-6e2a9c41.md`
- `Architecture`:
  `.standards/docs/specs/overdue-loan-digest-20260922T141500Z-6e2a9c41.md`
- `Request`: `Queue one overdue-loan digest email per borrower, listing their overdue items.`

## Build Steps

### DEV-001 — Build per-borrower overdue digests

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `AC-001, AC-002, AC-003`

**Goal**

Group overdue, unreturned loans by borrower and order each borrower's items.

**Affected Area**

`src/digest.js` (new): `buildDigests(loans, today)`.

**Expected Outcome**

`buildDigests` returns one entry per borrower (address compared
case-insensitively after trimming) with items `{ title, days }` sorted by days
overdue descending, then title; loans whose `daysOverdue` is 0 are skipped.

**Self-Check**

In the project root on the uncommitted `src/digest.js`: an ad hoc
`node --input-type=module -e` script calling `buildDigests` on a four-loan
sample (two casings of one address, one returned loan, one loan due today)
printed one grouped entry with the expected order and no excluded loans.
`npm test` exit 0, 4 tests passed (existing suites only). Limitation: ad hoc
sample only; formal tests are Tester-owned.

### DEV-002 — Queue digests through the outbox

`Status`: `DONE` `Depends On`: `DEV-001` `Acceptance`: `AC-004`

**Goal**

Render each digest and queue it through the existing outbox.

**Affected Area**

`src/digest.js`: `queueOverdueDigests(loans, today, outbox)` and the private
`renderBody`; uses `queueMessage` from `src/mailer.js` unchanged.

**Expected Outcome**

One outbox message per digest, addressed to the borrower's email, subject
`Overdue items: N` with N equal to the item lines in the body; returns the
number queued.

**Self-Check**

In the project root on the uncommitted `src/digest.js`: the same ad hoc script
called `queueOverdueDigests` with `createOutbox()` and printed one message with
subject `Overdue items: 2` and two item lines. `npm test` exit 0, 4 tests
passed. Limitation as above.

## Plan Notes

- No changes to `src/loans.js`, `src/dates.js`, or `src/mailer.js`.
- Project references loaded: NONE.

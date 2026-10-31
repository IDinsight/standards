<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: add-late-fees-to-overdue-invoices-20260921T141200Z-5c8e2a91
-->

# Development Plan

`Cycle`: `add-late-fees-to-overdue-invoices-20260921T141200Z-5c8e2a91` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true` `Status`: `COMPLETE`
`Verification Cadence`: `AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/add-late-fees-to-overdue-invoices-20260921T141200Z-5c8e2a91.md`
- `Architecture`: `.standards/docs/specs/add-late-fees-to-overdue-invoices-20260921T141200Z-5c8e2a91.md`
- `Request`: `Add late fees to overdue invoices and show them on monthly statements.`

## Build Steps

### DEV-001 — Late fee calculation

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `AC-001, AC-002`

**Goal**

Compute an invoice's late fee in integer cents from its outstanding balance and
days past due.

**Affected Area**

`src/billing/lateFee.js` (new), using `daysOverdue` and `outstandingCents` from
`src/billing/invoices.js`.

**Expected Outcome**

`lateFeeCents` returns 1.5% of the outstanding balance, rounded half up to the
cent, when the invoice is more than 14 days past due, and 0 otherwise or when
paid.

**Self-Check**

`npm test` in the project root on the working tree on top of
${COMMIT:Record late fee scope and design}: exit 0, 6 existing tests passed.

**Implementation Notes**

Originally defaulted `asOf` to the current UTC date; DEV-003 makes `asOf`
required.

### DEV-002 — Late fees on statements

`Status`: `DONE` `Depends On`: `DEV-001` `Acceptance`: `AC-003`

**Goal**

Add each invoice's late fee to its statement line and to the statement total.

**Affected Area**

`src/billing/statement.js`.

**Expected Outcome**

Each statement line has `lateFeeCents`; `totalCents` includes the fees.

**Self-Check**

`npm test` in the project root on the same working tree: exit 0, 6 existing
tests passed (statement scenarios unchanged).

### DEV-003 — Evaluate late fees as of an explicit date

`Status`: `DONE` `Depends On`: `DEV-001, DEV-002` `Acceptance`: `AC-001, AC-002, AC-003`

**Goal**

Apply the corrected design: fees are evaluated as of a date the caller
supplies, never the system clock.

**Affected Area**

`src/billing/lateFee.js`, `src/billing/statement.js`.

**Expected Outcome**

`lateFeeCents(invoice, asOf)` requires `asOf` and throws `TypeError` without it;
`buildStatement` passes its `statementDate`, so rebuilding a statement gives the
same fees and total.

**Self-Check**

`npm test` in the project root, 2026-09-23, on the working tree on top of
${COMMIT:Define the late fee evaluation date}: exit 0, 12 passed, 0 failed.
`grep -rn 'new Date' src/billing`: no matches.

---

## Plan Notes

Revised during recovery for the evaluation-date design correction: DEV-003 was
added and the user approved the revised plan on 2026-09-23 before
implementation. DEV-001 and DEV-002 keep their outcomes; DEV-003 changes their
call contract. Project references loaded: NONE.

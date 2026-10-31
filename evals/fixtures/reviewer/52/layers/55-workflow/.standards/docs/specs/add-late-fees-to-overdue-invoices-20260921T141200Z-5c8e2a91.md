<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: add-late-fees-to-overdue-invoices-20260921T141200Z-5c8e2a91
-->

# Technical Design

## Context

Scope: late fees for invoices more than 14 days past due (AC-001, AC-002) and
their inclusion on statements (AC-003). `src/billing/invoices.js` already
provides `daysOverdue(invoice, asOf)` and `outstandingCents(invoice)` in integer
cents (see `.standards/CONTEXT.md`).

## Decision

- Add `src/billing/lateFee.js` exporting `GRACE_DAYS = 14` and
  `lateFeeCents(invoice)`.
- Compute in integer cents: `floor((outstanding * 15 + 500) / 1000)`, which is
  1.5% rounded to the nearest cent with half a cent rounded up. No
  floating-point currency.
- `buildStatement` adds each invoice's fee to its line and to the total.

## Acceptance Coverage

- `AC-001`: `lateFeeCents` formula above, applied when `daysOverdue` is greater
  than `GRACE_DAYS` and the balance is positive.
- `AC-002`: `lateFeeCents` returns 0 when `outstandingCents` is 0 or
  `daysOverdue` is at most `GRACE_DAYS`; days past due as `daysOverdue` defines
  them.
- `AC-003`: statement lines carry `lateFeeCents`; `totalCents` includes the
  fees.

## Interfaces and Contracts

- `lateFeeCents(invoice) -> integer cents`. `invoice` has `dueDate`,
  `totalCents`, and `payments[].amountCents`.
- `buildStatement(customer, invoices, statementDate)`: each line gains
  `lateFeeCents`; `totalCents` is the sum of each line's
  `outstandingCents + lateFeeCents`. The return shape is otherwise unchanged.

## Technical Acceptance Criteria

- `AC-001`: the fee is an integer number of cents for every integer balance.
- `AC-003`: `totalCents` equals the sum of outstanding balances and fees of the
  listed lines.

## Build Plan

1. CREATE `src/billing/lateFee.js`.
2. MODIFY `src/billing/statement.js` to add fees to lines and the total.

## Risks and Follow-up

- Fees are not stored; a statement shows the fee computed when it is built.
  Persisting charged fees is outside this scope.

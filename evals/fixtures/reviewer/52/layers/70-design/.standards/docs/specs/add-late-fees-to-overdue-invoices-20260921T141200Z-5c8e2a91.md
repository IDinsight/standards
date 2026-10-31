<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: add-late-fees-to-overdue-invoices-20260921T141200Z-5c8e2a91
-->

# Technical Design

## Context

Scope: late fees for invoices more than 14 days past due (AC-001, AC-002) and
their inclusion on statements (AC-003). `src/billing/invoices.js` already
provides `daysOverdue(invoice, asOf)` and `outstandingCents(invoice)` in integer
cents, and `src/billing/reminders.js` already evaluates date rules against an
explicit `asOf` date (see `.standards/CONTEXT.md`). Revised during recovery: the
first version did not define the evaluation date
(`.standards/docs/reviews/add-late-fees-to-overdue-invoices-20260921T141200Z-5c8e2a91/implementation.md#F-001`).

## Decision

- Add `src/billing/lateFee.js` exporting `GRACE_DAYS = 14` and
  `lateFeeCents(invoice, asOf)`.
- Compute in integer cents: `floor((outstanding * 15 + 500) / 1000)`, which is
  1.5% rounded to the nearest cent with half a cent rounded up. No
  floating-point currency.
- Evaluation date: fees are evaluated as of the `asOf` date the caller supplies,
  following the reminders convention. The module never reads the system clock.
- `buildStatement` evaluates each line's fee as of its `statementDate`.

## Acceptance Coverage

- `AC-001`: `lateFeeCents` formula above, applied when
  `daysOverdue(invoice, asOf)` is greater than `GRACE_DAYS` and the balance is
  positive.
- `AC-002`: `lateFeeCents` returns 0 when `outstandingCents` is 0 or
  `daysOverdue(invoice, asOf)` is at most `GRACE_DAYS`; days past due as
  `daysOverdue` defines them.
- `AC-003`: statement lines carry `lateFeeCents` evaluated as of
  `statementDate`; `totalCents` includes the fees.

## Interfaces and Contracts

- `lateFeeCents(invoice, asOf) -> integer cents`. `invoice` has `dueDate`,
  `totalCents`, and `payments[].amountCents`. `asOf` is required: a
  `YYYY-MM-DD` string read as a UTC day, the same form `daysOverdue` takes.
  Calling without `asOf` throws `TypeError`.
- `buildStatement(customer, invoices, statementDate)`: each line gains
  `lateFeeCents`, evaluated as of `statementDate`; `totalCents` is the sum of
  each line's `outstandingCents + lateFeeCents`. The return shape is otherwise
  unchanged.

## Technical Acceptance Criteria

- `AC-001`: the fee is an integer number of cents for every integer balance.
- `AC-001`, `AC-002`: `lateFeeCents` depends only on the invoice and `asOf`;
  the same inputs give the same result on any day.
- `AC-003`: a statement for a given `statementDate` shows the same fees and
  total whenever it is built, and `totalCents` equals the sum of outstanding
  balances and fees of the listed lines.

## Build Plan

1. CREATE `src/billing/lateFee.js` with a required `asOf`.
2. MODIFY `src/billing/statement.js` to add fees to lines and the total,
   passing `statementDate`.

## Risks and Follow-up

- Fees are not stored; a statement shows the fee computed for its date.
  Persisting charged fees is outside this scope.

## Alternatives

- Reading the clock inside `lateFeeCents` with an optional override: rejected
  because statements must be reproducible for their own date.

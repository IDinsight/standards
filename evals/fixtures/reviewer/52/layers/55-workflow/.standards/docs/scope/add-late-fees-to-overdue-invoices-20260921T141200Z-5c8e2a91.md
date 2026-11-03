<!-- STANDARDS
Artifact: SCOPE
Cycle: add-late-fees-to-overdue-invoices-20260921T141200Z-5c8e2a91
-->

# Late Fees on Overdue Invoices

## Goal

Charge a late fee on invoices that stay unpaid past a grace period and show it
on customer statements, so the finance team no longer adds fees by hand.

## Constraints

- Amounts stay in integer cents, as the billing module already stores them.
- Days past due are whole days after the due date, as `daysOverdue` in
  `src/billing/invoices.js` already counts them for reminders.

## Non-goals

- Recurring or compounding fees.
- Waiving fees or recording fee payments.
- Changing reminder timing.

## Work

### 1. Late fee calculation

**Intent:** Give every invoice a well-defined late fee that the billing jobs can
use.

**Done when:**

- `AC-001`: An invoice with an outstanding balance that is more than 14 days
  past its due date has a late fee of 1.5% of the outstanding balance, rounded
  to the nearest cent with half a cent rounded up.
- `AC-002`: An invoice that is fully paid, or that is 14 or fewer days past its
  due date, has a late fee of 0.

**Depends on:** None

### 2. Late fees on statements

**Intent:** Customers see the fees they owe on their statement.

**Done when:**

- `AC-003`: A statement built for a given date lists each invoice's late fee as
  of that date and includes the fees in the statement total.

**Depends on:** 1

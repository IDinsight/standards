<!-- STANDARDS
Artifact: SCOPE
Cycle: add-due-dates-to-invoices-based-on-20260311T101500Z-3c9e51a7
-->

# Invoice Due Dates

## Goal

Invoices tell customers when payment is due, based on their payment terms, so
receivables can be aged.

## Non-goals

- Payment reminders, late fees, or dunning.
- Storing payment terms per customer; callers supply them.

## Work

### 1. Due date on every invoice

**Intent:** Every invoice states when it must be paid.

**Done when:**

- `AC-001`: An invoice issued without payment terms is due 30 days after its issue date.
- `AC-002`: An invoice issued with payment terms of N days is due N days after its issue date.
- `AC-003`: The README explains how an invoice's due date is determined.

**Depends on:** None

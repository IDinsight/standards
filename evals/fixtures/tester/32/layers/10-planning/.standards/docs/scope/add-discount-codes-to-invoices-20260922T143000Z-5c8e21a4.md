<!-- STANDARDS
Artifact: SCOPE
Cycle: add-discount-codes-to-invoices-20260922T143000Z-5c8e21a4
-->

# Invoice Discount Codes

## Goal

Let callers apply a discount code from the shop's code catalog to an invoice so
that the discount is reflected in the invoice totals, without changing the
totals of invoices that carry no code.

## Constraints

- Amounts remain integer cents, consistent with the existing invoice totals.
- Invoices remain immutable; applying a code produces a new invoice.
- The code catalog is supplied by the caller.

## Non-goals

- Combining several codes on one invoice.
- Creating, editing, or storing codes in the catalog.
- Persisting invoices or rendering them for customers.

## Work

### 1. Percentage codes and code validation

**Intent:** Staff can give customers percentage discounts from the catalog, and
a mistyped or out-of-date code never silently changes an invoice.

**Done when:**

- `AC-001`: Applying a valid percentage code reduces the invoice's taxable
  amount by that percentage of the subtotal, rounded to the nearest cent with
  halves rounded up, and tax is computed on the reduced amount.
- `AC-002`: An unknown code, or a code used after its expiry date, is rejected
  with a discount error that identifies the reason, and the invoice's totals are
  unchanged.
- `AC-003`: An invoice with no discount code has the same subtotal, tax, and
  total as before this change.

**Depends on:** None

### 2. Fixed-amount codes

**Intent:** Staff can also give fixed-amount discounts, which must never produce
a negative invoice.

**Done when:**

- `AC-004`: Applying a valid fixed-amount code reduces the taxable amount by
  that amount, never below zero.

**Depends on:** 1

## Assumptions

- Callers pass the current date as an ISO calendar date; time zones are handled
  by the caller.

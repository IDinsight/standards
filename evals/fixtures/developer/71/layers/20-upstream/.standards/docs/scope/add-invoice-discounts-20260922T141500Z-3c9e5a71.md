<!-- STANDARDS
Artifact: SCOPE
Cycle: add-invoice-discounts-20260922T141500Z-3c9e5a71
-->

# Invoice Discounts

## Goal

Let staff apply a fixed-amount discount to an invoice so that its totals and
the printed invoice reflect the reduced price.

## Constraints

- Amounts stay in integer cents, as in the existing totals module.
- Invoices without a discount keep their current totals and printed layout.

## Non-goals

- Percentage discounts, per-line discounts, and coupon codes.

## Work

### 1. Discounted totals

**Intent:** Totals must reflect the discount so the amount due is correct.

**Done when:**

- `AC-001`: For an invoice with a discount of D cents, tax is computed on the
  subtotal minus D, and the total equals the subtotal minus D plus that tax.
- `AC-002`: A discount that is negative, not a whole number of cents, or larger
  than the subtotal is rejected with an error and no totals are returned.

**Depends on:** None

### 2. Printed discount line

**Intent:** Customers can see the discount on the invoice they receive.

**Done when:**

- `AC-003`: A printed invoice with a nonzero discount shows a `Discount` line
  between `Subtotal` and `Tax`; an invoice without a discount prints exactly as
  before.

**Depends on:** 1

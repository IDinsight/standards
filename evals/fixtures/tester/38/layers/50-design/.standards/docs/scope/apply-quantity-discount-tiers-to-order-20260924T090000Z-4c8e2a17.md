<!-- STANDARDS
Artifact: SCOPE
Cycle: apply-quantity-discount-tiers-to-order-20260924T090000Z-4c8e2a17
-->

# Quantity Discount Tiers

## Goal

Customers who order in bulk get a quantity discount on each order line, and the
printed invoice shows the discount they received.

## Constraints

- Amounts remain integer cents; discounts are rounded to the nearest cent per
  line.
- Existing totals for lines under the first tier must not change.

## Non-goals

- Order-level or coupon discounts.
- Changes to how invoices are printed or delivered.

## Work

### 1. Discounted line pricing

**Intent:** Bulk lines are charged less, and every total built from line prices
reflects that.

**Done when:**

- `AC-001`: A line with a quantity from 10 to 49 is charged 5% less than unit
  price times quantity, rounded to the nearest cent.
- `AC-002`: A line with a quantity of 50 or more is charged 10% less than unit
  price times quantity, rounded to the nearest cent.
- `AC-003`: A line with a quantity below 10 is charged unit price times
  quantity, as before.

**Depends on:** None

### 2. Discounts on printed invoices

**Intent:** Customers can see on the invoice why a line costs less.

**Done when:**

- `AC-004`: Each discounted line on the printed invoice is followed by a row
  showing the discount percentage and amount, lines without a discount have no
  such row, and the invoice total equals the discounted order total.

**Depends on:** 1

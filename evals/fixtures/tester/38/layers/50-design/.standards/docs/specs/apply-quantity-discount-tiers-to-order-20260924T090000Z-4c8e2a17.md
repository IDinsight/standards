<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: apply-quantity-discount-tiers-to-order-20260924T090000Z-4c8e2a17
-->

# Technical Design

## Context

Quantity discount tiers change how `src/pricing.js` prices a line and add a
discount row to the invoice built by `src/invoice.js`. Amounts stay in integer
cents, as recorded in `.standards/CONTEXT.md`. No project references apply.

## Decision

- Keep the tiers in a table in `src/pricing.js`, ordered from the highest
  threshold: 50 or more units 10%, 10 or more units 5%.
- Export `discountRate(quantity)` and `lineDiscount(line)`. `lineDiscount`
  rounds `unitCents * quantity * rate` to the nearest cent with `Math.round`.
  `lineTotal` becomes gross minus `lineDiscount`. `orderTotal` is unchanged and
  therefore sums discounted lines.
- `formatInvoice` prints a discount row after each line whose `lineDiscount` is
  above zero; the total row keeps using `orderTotal`.

## Acceptance Coverage

- `AC-001`, `AC-002`: tier table and `lineDiscount` in `src/pricing.js`;
  `lineTotal` subtracts the discount.
- `AC-003`: `discountRate` returns 0 below 10 units, so `lineTotal` equals unit
  price times quantity.
- `AC-004`: discount row in `formatInvoice`; total row from `orderTotal`.

## Interfaces and Contracts

- `discountRate(quantity)`: returns 0, 0.05, or 0.10.
- `lineDiscount(line)`: integer cents, never negative.
- `lineTotal(line)`: `unitCents * quantity - lineDiscount(line)`.
- Invoice discount row: two leading spaces, `discount 5%` or `discount 10%`,
  two spaces, then the amount with a leading minus and two decimals, for example
  `  discount 5%  -5.00`.

## Technical Acceptance Criteria

- `AC-001`: quantity 10 to 49 gives `lineDiscount` equal to 5% of gross,
  rounded.
- `AC-002`: quantity 50 or more gives `lineDiscount` equal to 10% of gross,
  rounded.
- `AC-003`: quantity below 10 gives `lineDiscount` 0.
- `AC-004`: each line with a nonzero discount is followed by exactly one
  discount row; other lines have none; the total row equals `orderTotal`.

## Build Plan

1. MODIFY `src/pricing.js`: tier table, `discountRate`, `lineDiscount`, and
   discounted `lineTotal`.
2. MODIFY `src/invoice.js`: discount row after each discounted line.

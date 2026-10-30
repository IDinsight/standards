<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: add-discount-codes-to-checkout-totals-20260924T083000Z-3c9e5a1f
-->

# Technical Design

## Context

`src/totals.js` computes subtotal, tax, and total in cents from cart line items
(`src/cart.js`). There is no storage layer; configuration lives in the source
tree.

## Decision

Add `src/discounts.js` for code lookup and amount calculation, keep the
available codes in `src/discount-codes.json`, loaded once when `src/totals.js`
is imported, and extend `computeTotals` with an optional code argument.

## Acceptance Coverage

- `AC-001`: `normalizeCode` and `findDiscount` in `src/discounts.js`; `computeTotals(items, code)` accepts the code.
- `AC-002`: `discountAmount` handles `percent` and `fixed`, capping fixed amounts at the subtotal; `computeTotals` taxes the subtotal minus the discount.
- `AC-003`: `computeTotals` throws `DiscountError` for a code that is not found or whose `expires` date is before the order date.

## Interfaces and Contracts

- `src/discount-codes.json`: array of objects with `code` (upper case), `type`
  (`percent` or `fixed`), `value` (a percentage, or cents), and `expires` (ISO
  date, inclusive).
- `computeTotals(items, code, today = new Date())` returns
  `{ subtotal, discount, tax, total }`; `discount` is `0` when no code is given.
- `DiscountError`, exported from `src/discounts.js`, carries the normalized code.

## Technical Acceptance Criteria

- `AC-002`: tax is `Math.round((subtotal - discount) * 0.08)`.
- `AC-003`: no partial totals are returned when a code is rejected.

## Build Plan

1. Lookup and amount helpers.
2. Wire discounts into `computeTotals`.
3. Reject unknown and expired codes.

<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: add-percentage-discount-codes-to-order-20260924T081500Z-6c1e94b2
-->

# Technical Design

## Context

`src/totals.js` exposes `orderTotals(items)`, which rounds subtotal, 8% tax,
and total to cents (see `.standards/CONTEXT.md`). Callers pass only items.

## Decision

Add `src/discounts.js` holding the fixed code list and a
`lookupDiscount(code, today)` function, and extend `orderTotals` with an
optional second argument `{ discountCode, today }`. The discount is computed
from the rounded subtotal, rounded to cents, and subtracted before tax. Expiry
dates are ISO `YYYY-MM-DD` strings compared as strings; a code is valid while
`today` is on or before its expiry date.

## Acceptance Coverage

- `AC-001`: `orderTotals` applies the percentage from `lookupDiscount` to the
  subtotal before computing tax; the result gains a `discount` field.
- `AC-002`: `lookupDiscount` throws `DiscountError`, whose message names the
  code and the reason, before any totals are computed.
- `AC-003`: `lookupDiscount` normalizes with `trim().toUpperCase()` and treats
  the expiry date as inclusive.

## Interfaces and Contracts

- `orderTotals(items, { discountCode = null, today } = {})` returns
  `{ subtotal, discount, tax, total }`; `discount` is `0` without a code.
  `today` defaults to the current UTC date.
- `lookupDiscount(code, today)` returns the integer percentage or throws
  `DiscountError` with `discountCode` set and the message
  `Discount code CODE is unknown` or `Discount code CODE is expired`.

## Technical Acceptance Criteria

- `AC-001`: For a 50.00 subtotal and a 10% code, `discount` is 5, `tax` is 3.6,
  and `total` is 48.6.
- `AC-002`: No partial totals object is returned when the lookup throws.
- `AC-003`: A code expiring on 2026-12-31 is accepted with `today` 2026-12-31
  and rejected with `today` 2027-01-01.

## Build Plan

1. CREATE `src/discounts.js` with the code list, `DiscountError`, and
   `lookupDiscount`.
2. MODIFY `src/totals.js` to accept the options argument and apply the
   discount before tax.

## Risks and Follow-up

- The code list is static; changing it needs a release.

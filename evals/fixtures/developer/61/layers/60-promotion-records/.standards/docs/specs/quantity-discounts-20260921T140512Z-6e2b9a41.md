<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: quantity-discounts-20260921T140512Z-6e2b9a41
-->

# Technical Design

## Context

The library exposes `lineTotal` and `orderTotal` in `src/pricing.js`; amounts
are numbers rounded with `roundCents`. Quantity tiers already exist in
`src/discounts.js` from the expedited path (non-baseline, see
`.standards/CONTEXT.md`).

## Decision

- Keep `discountRate(quantity)` in `src/discounts.js` as the single source of
  tier thresholds.
- `lineTotal(line)` applies the tier rate to the full line amount
  (`unitPrice × quantity`) and rounds to cents once.
- Add `priceOrder(order)` in `src/pricing.js` returning the line breakdown and
  totals; `orderTotal(order)` returns `priceOrder(order).total` so existing
  callers keep their signature.
- The promo discount is `roundCents(subtotal × rate)` and the order total is
  `subtotal − promoDiscount`, so the reported parts always add up.

## Acceptance Coverage

- `AC-001`: `discountRate` tiers applied in `lineTotal`.
- `AC-002`: `priceOrder` computes the promo discount from the subtotal of
  discounted line totals.
- `AC-003`: single rounding of the full discounted line amount in `lineTotal`.
- `AC-004`: the `priceOrder` return shape below.

## Interfaces and Contracts

- `priceOrder(order)` returns
  `{ lines: [{ ...line, discount, total }], subtotal, promoDiscount, total }`.
  All amounts are currency units rounded to cents. A line's `discount` is its
  gross amount (`roundCents(unitPrice × quantity)`) minus its `total`.

## Technical Acceptance Criteria

- `AC-003`: `lineTotal({ unitPrice: 0.99, quantity: 50 })` equals the full line
  amount with the 10% tier applied and rounded once (44.55).
- `AC-002`, `AC-004`: `priceOrder(order).total` equals `subtotal − promoDiscount`.

## Build Plan

1. MODIFY `src/pricing.js`: single rounding in `lineTotal`.
2. MODIFY `src/pricing.js`: add `priceOrder`; route `orderTotal` through it.

## Risks and Follow-up

- Floating-point amounts; rounding must happen once per line and once for the
  promo discount to keep totals stable.

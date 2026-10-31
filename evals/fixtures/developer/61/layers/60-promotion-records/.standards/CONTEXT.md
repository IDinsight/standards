# Project Context

## Project Baseline

- Small Node.js (ES modules) order-pricing library: line totals, promo codes,
  and order totals. No runtime dependencies.

## Stack and Tooling

- Node 22, plain JavaScript with `"type": "module"`. Tests use `node:test`
  with explicit file arguments.

## Structure and Boundaries

- `src/pricing.js` — `roundCents`, `promoRate`, `lineTotal`, `orderTotal`;
  the only pricing entry points callers use.
- `src/discounts.js` — quantity discount tiers (active-cycle work, see below).
- `test/pricing.test.js` — baseline tests for line totals, order totals, and
  promo codes.

## Commands

- `npm test` — runs `node --test test/pricing.test.js`. New test files must be
  added to the script explicitly.

## Conventions and Constraints

- Amounts are JavaScript numbers in currency units, rounded to cents with
  `roundCents` (`Math.round` on cents).
- Unknown promo codes are ignored (rate 0), not rejected.

## Relevant Existing Behavior

- Before this cycle, the promo percentage applied to the order subtotal and the
  order total was rounded once.
- Orders without promo codes total the sum of their line totals.

## Active-Cycle Non-Baseline Work

- `Cycle: quantity-discounts-20260921T140512Z-6e2b9a41; src/discounts.js and the discountRate call in lineTotal (src/pricing.js)`
  — tentative implementation from the expedited path, commit
  ${COMMIT:Add quantity discount tiers to line pricing}; not established
  baseline.

## Evidence

- `git log` — pre-cycle code is the initial commit; discount tiers arrived in
  the expedited commit above.
- `node --test test/pricing.test.js` — 4 passing on both commits.

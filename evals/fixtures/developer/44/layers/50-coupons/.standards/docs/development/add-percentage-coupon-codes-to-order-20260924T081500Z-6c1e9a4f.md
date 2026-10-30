<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: add-percentage-coupon-codes-to-order-20260924T081500Z-6c1e9a4f
-->

# Development Plan

`Cycle`: `add-percentage-coupon-codes-to-order-20260924T081500Z-6c1e9a4f`
`Mode`: `AUTONOMOUS` `User Style`: `NONE` `User Style Locked`: `true`
`Status`: `COMPLETE` `Verification Cadence`: `AFTER_IMPLEMENTATION`
`Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `NONE`
- `Architecture`: `NONE`
- `Request`: `Add percentage coupon codes to order totals; the discount is a percentage of the subtotal rounded to the nearest cent.`

## Build Steps

### DEV-001 — Coupon code lookup

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `EXPEDITED_REQUEST`

**Goal**

Resolve a coupon code to its percentage discount.

**Affected Area**

New `src/coupons.js`.

**Expected Outcome**

`couponPercent` returns the percentage for a known code, ignoring case and
surrounding spaces, and throws `RangeError` for an unknown code.

**Self-Check**

Project root, working tree before commit: a `node -e` sanity check printed
`10`, `25`, and `RangeError` for `save10`, `STAFF25` with surrounding spaces,
and `NOPE`. `node --test test/totals.test.js`: exit 0, 4 passed (the existing
tests do not cover coupons).

### DEV-002 — Apply the coupon discount in orderTotal

`Status`: `DONE` `Depends On`: `DEV-001` `Acceptance`: `EXPEDITED_REQUEST`

**Goal**

Let `orderTotal` take an optional coupon code and subtract its discount from
the subtotal.

**Affected Area**

`src/totals.js` (`discountCents`, `orderTotal`).

**Expected Outcome**

`orderTotal(lines)` behaves as before; `orderTotal(lines, code)` returns the
subtotal minus the coupon percentage of the subtotal, rounded to the nearest
cent.

**Self-Check**

Project root, working tree before commit: a `node -e` sanity check printed
`810` for two `TEA-01` at 450 cents with `SAVE10`, and `900` with no coupon.
`node --test test/totals.test.js`: exit 0, 4 passed.

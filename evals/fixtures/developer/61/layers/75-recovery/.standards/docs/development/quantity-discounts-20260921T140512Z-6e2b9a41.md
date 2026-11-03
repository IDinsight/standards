<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: quantity-discounts-20260921T140512Z-6e2b9a41
-->

# Development Plan

`Cycle`: `quantity-discounts-20260921T140512Z-6e2b9a41` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true` `Status`: `PROPOSED`
`Verification Cadence`: `AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/quantity-discounts-20260921T140512Z-6e2b9a41.md`
- `Architecture`: `.standards/docs/specs/quantity-discounts-20260921T140512Z-6e2b9a41.md`
- `Request`: `Add quantity discount tiers to order line pricing.`

## Build Steps

### DEV-001 — Quantity discount tiers in line pricing

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `AC-001`

**Goal**

Apply the quantity discount tier to each order line.

**Affected Area**

`src/discounts.js` (new `discountRate` and tier table) and `lineTotal` in
`src/pricing.js`.

**Expected Outcome**

Lines of 10, 50, and 100 or more units get 5%, 10%, and 15% off; lines below
10 units are priced as before.

**Self-Check**

`npm test` in the project root at commit
${COMMIT:Add quantity discount tiers to line pricing}: exit 0, 4 passing.
Manual check with `node -e`: `lineTotal({ unitPrice: 4, quantity: 10 })`
returns 38.

**Implementation Notes**

Written during the expedited path and reconciled after promotion: acceptance
mapped to AC-001.

### DEV-002 — Priced order breakdown

`Status`: `DONE` `Depends On`: `DEV-001` `Acceptance`: `AC-002, AC-004`

**Goal**

Expose the per-line discount, subtotal, promo discount, and total, with the
promo applied to discounted lines.

**Affected Area**

`priceOrder` and `orderTotal` in `src/pricing.js`.

**Expected Outcome**

`priceOrder(order)` returns the design's breakdown; `orderTotal(order)` equals
`priceOrder(order).total`, and existing callers keep their signature.

**Self-Check**

`npm test` in the project root at commit ${COMMIT:Add priced order breakdown}:
exit 0, 4 passing. Manual check with `node -e` on a 10-unit line at 4.00 with
`SPRING10`: discount 2, subtotal 38, promo discount 3.8, total 34.2.

### DEV-003 — Single rounding of discounted line totals

`Status`: `PENDING` `Depends On`: `DEV-001` `Acceptance`: `AC-001, AC-003`

**Goal**

Compute each line total from the full line amount and round it once, replacing
the per-unit rounding in `lineTotal`.

**Affected Area**

`lineTotal` in `src/pricing.js`.

**Expected Outcome**

The line amount is computed in integer cents (unit price in cents times
quantity), the tier rate is applied to that amount, and the result is rounded
to a whole cent once. 50 units at 0.99 with the 10% tier total 44.55. The
`priceOrder` breakdown follows from the corrected line totals.

**Self-Check**

Planned: `node --test test/pricing.test.js test/discounts.test.js` in the
project root; all scenarios, including the single-rounding one, expected to
pass. Not yet run.

## Plan Notes

- Revised after the Tester failure in recovery frame 1. AC-003 was previously
  attributed to DEV-001, whose `lineTotal` rounds the discounted unit price
  before multiplying. DEV-003 changes the line arithmetic to integer cents with
  one rounding step, a change of technical approach in approved work, so the
  plan is `PROPOSED` again and needs approval before the correction is
  implemented.
- The user asked for incremental verification of the remaining work. The
  request is pending in `STATE.md` and is applied at the next normal
  development boundary, not during this correction.
- The outstanding obligation in `STATE.md` belongs to implementation review.
- Project references loaded: `NONE`.

<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: apply-quantity-discount-tiers-to-order-20260924T090000Z-4c8e2a17
-->

# Development Plan

`Cycle`: `apply-quantity-discount-tiers-to-order-20260924T090000Z-4c8e2a17`
`Mode`: `AUTONOMOUS` `User Style`: `NONE` `User Style Locked`: `true`
`Status`: `IN_PROGRESS` `Verification Cadence`: `INCREMENTAL`
`Current Increment`: `1`

## Implementation Contract

- `Scope`:
  `.standards/docs/scope/apply-quantity-discount-tiers-to-order-20260924T090000Z-4c8e2a17.md`
- `Architecture`:
  `.standards/docs/specs/apply-quantity-discount-tiers-to-order-20260924T090000Z-4c8e2a17.md`
- `Request`: `Quantity discount tiers on order lines, shown on printed invoices.`

## Build Steps

### DEV-001 — Discount tiers in line pricing

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `AC-001, AC-002, AC-003`

**Goal**

Price each line with the quantity discount tier from the design.

**Affected Area**

`src/pricing.js`.

**Expected Outcome**

`discountRate` and `lineDiscount` are exported; `lineTotal` returns gross minus
the rounded discount (5% from 10 units, 10% from 50 units, none below 10).
`orderTotal` sums the discounted lines without other changes.

**Self-Check**

`npm test` in the project root on the DEV-001 working tree (only
`src/pricing.js` changed, committed with this plan): exit 0, 3 tests passed.
Spot check with `node --input-type=module -e` on `lineTotal` with 1000-cent
units: 10 units gave 9500, 50 units gave 45000.

**Implementation Notes**

The tier table is ordered from the highest threshold so the first match wins.

### DEV-002 — Discount rows on printed invoices

`Status`: `PENDING` `Depends On`: `DEV-001` `Acceptance`: `AC-004`

**Goal**

Show the applied discount under each discounted line of the printed invoice.

**Affected Area**

`src/invoice.js`.

**Expected Outcome**

`formatInvoice` prints the design's discount row after each line with a nonzero
`lineDiscount`; the total row still comes from `orderTotal`.

**Self-Check**

Planned: `npm test` in the project root. Not run yet.

## Verification Increments

### Increment 1

`Development Steps`: `DEV-001` `Acceptance`: `AC-001, AC-002, AC-003`

**Ready Outcome**

Line and order totals apply the 5% and 10% quantity tiers and leave lines under
10 units at full price. The invoice total reflects the discounted order total;
discount rows are not printed yet.

### Increment 2

`Development Steps`: `DEV-002` `Acceptance`: `AC-004`

**Ready Outcome**

The printed invoice shows a discount row under each discounted line.

## Plan Notes

- The user approved this plan with incremental verification.
- Project references loaded: NONE.

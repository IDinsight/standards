<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: add-invoice-discounts-20260922T141500Z-3c9e5a71
-->

# Development Plan

`Cycle`: `add-invoice-discounts-20260922T141500Z-3c9e5a71` `Mode`: `STEPWISE`
`User Style`: `tony` `User Style Locked`: `true` `Status`: `COMPLETE`
`Verification Cadence`: `AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`:
  `.standards/docs/scope/add-invoice-discounts-20260922T141500Z-3c9e5a71.md`
- `Architecture`:
  `.standards/docs/specs/add-invoice-discounts-20260922T141500Z-3c9e5a71.md`
- `Request`: `Add invoice discounts.`

## Build Steps

### DEV-001 — Discount-aware totals

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `AC-001, AC-002`

**Goal**

`computeTotals` accepts a fixed discount in cents, applies it before tax, and
rejects out-of-range discounts.

**Affected Area**

`src/totals.js` (`computeTotals`).

**Expected Outcome**

`computeTotals(lines, { taxRate, discountCents })` returns
`{ subtotal, discount, tax, total }` with tax computed on
`subtotal - discountCents`. A negative, non-integer, or larger-than-subtotal
discount throws `RangeError`. Calls without `discountCents` return the same
subtotal, tax, and total as before, with `discount: 0`.

**Self-Check**

- `npm test` in the repository root, working tree with DEV-001 applied on top
  of `Record context, scope, and design for invoice discounts`: exit 0, 3
  passed, 0 failed.
- Sanity script run with `node --input-type=module -e` in the repository root,
  importing `src/totals.js`: the two-line sample invoice from the test suite
  (subtotal 4249) with `taxRate: 0.08, discountCents: 500` returned
  `{ subtotal: 4249, discount: 500, tax: 300, total: 4049 }`;
  `discountCents: 5000`, `-1`, and `2.5` each threw `RangeError`.
- Limitation: discount behavior has no automated test yet; formal coverage is
  Tester's.

**Implementation Notes**

Validation sits at the public boundary (`computeTotals`) and throws a specific
error type, per the selected user style.

### DEV-002 — Printed discount line

`Status`: `DONE` `Depends On`: `DEV-001` `Acceptance`: `AC-003`

**Goal**

`renderInvoice` passes the invoice discount to `computeTotals` and prints a
discount row when it is nonzero.

**Affected Area**

`src/format.js` (`renderInvoice`).

**Expected Outcome**

An invoice with `discountCents > 0` prints `Discount  -X.XX` between
`Subtotal` and `Tax`; an invoice without `discountCents` prints exactly as
before.

**Self-Check**

- `npm test` in the repository root, working tree with DEV-001 and DEV-002
  applied: exit 0, 3 passed, 0 failed (the existing layout test confirms the
  no-discount output is unchanged).
- Sanity script run with `node --input-type=module -e` in the repository root,
  importing `src/format.js`: the sample invoice with `taxRate: 0.08,
  discountCents: 500` printed `Subtotal  42.49`, `Discount  -5.00`,
  `Tax  3.00`, `Total  40.49` in that order.

## Plan Notes

- Implemented one step at a time under STEPWISE; the user confirmed
  continuation after DEV-001.
- Project references loaded: `NONE`.
- No tests were added or changed.

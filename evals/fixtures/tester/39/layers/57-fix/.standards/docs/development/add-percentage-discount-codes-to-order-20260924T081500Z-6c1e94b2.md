<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: add-percentage-discount-codes-to-order-20260924T081500Z-6c1e94b2
-->

# Development Plan

`Cycle`: `add-percentage-discount-codes-to-order-20260924T081500Z-6c1e94b2`
`Mode`: `AUTONOMOUS` `User Style`: `NONE` `User Style Locked`: `true`
`Status`: `COMPLETE` `Verification Cadence`: `AFTER_IMPLEMENTATION`
`Current Increment`: `NONE`

## Implementation Contract

- Scope: `.standards/docs/scope/add-percentage-discount-codes-to-order-20260924T081500Z-6c1e94b2.md`
- Architecture: `.standards/docs/specs/add-percentage-discount-codes-to-order-20260924T081500Z-6c1e94b2.md`
- Request: Add percentage discount codes to order totals.

## Build Steps

### DEV-001 — Discount code lookup

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `AC-002, AC-003`

**Goal**

Add the fixed code list and a lookup that normalizes the code and rejects
unknown or expired codes.

**Affected Area**

`src/discounts.js` (new).

**Expected Outcome**

`lookupDiscount(code, today)` returns the code's percentage, or throws
`DiscountError` naming the code; codes are valid through their expiry date.

**Self-Check**

Initial pass, in the project root on the uncommitted working tree: `node -e`
calls of `lookupDiscount` for `SPRING10`, ` spring10 `, and `NOPE` with today
2026-09-01 returned 10, 10, and threw `DiscountError` with message
"Discount code NOPE is unknown".

Correction, in the project root on the uncommitted working tree on top of the
final-review commit: `node -e` calls for `SPRING10` with today 2026-12-31 and
2027-01-01 returned 10 and threw `DiscountError` with message
"Discount code SPRING10 is expired"; `npm test` exited 0 with 5 passed.

**Implementation Notes**

Reopened during recovery for
.standards/docs/reviews/add-percentage-discount-codes-to-order-20260924T081500Z-6c1e94b2/final-deliverable.md#F-001:
the expiry check compared with `<=`, rejecting codes on their last valid day.
It now rejects only when the expiry date is before `today`.

### DEV-002 — Apply the discount in order totals

`Status`: `DONE` `Depends On`: `DEV-001` `Acceptance`: `AC-001, AC-002`

**Goal**

Extend `orderTotals` with the optional discount argument and subtract the
discount before tax.

**Affected Area**

`src/totals.js`.

**Expected Outcome**

The result includes `discount`; tax is computed on the discounted subtotal;
an invalid code throws before totals are computed; calls without a code are
unchanged.

**Self-Check**

In the project root on the uncommitted working tree, `npm test` exited 0 with
1 test passing (existing no-discount cart). A `node -e` call with that cart and
`SPRING10` on 2026-09-01 printed
`{ subtotal: 50, discount: 5, tax: 3.6, total: 48.6 }`.

## Plan Notes

- Recovery Frame 1 (from REVIEWING_FINAL): after correcting DEV-001, the
  affected downstream work is Tester's verification and the implementation
  review, so the frame's RerunThrough is REVIEWING_IMPLEMENTATION before final
  review resumes. The README already states the inclusive expiry rule, so the
  documentation record is unaffected.
- Project references loaded: NONE.

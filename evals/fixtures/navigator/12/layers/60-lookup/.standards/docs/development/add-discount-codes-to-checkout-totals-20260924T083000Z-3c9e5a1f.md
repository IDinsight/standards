<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: add-discount-codes-to-checkout-totals-20260924T083000Z-3c9e5a1f
-->

# Development Plan

`Cycle`: `add-discount-codes-to-checkout-totals-20260924T083000Z-3c9e5a1f` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true`
`Status`: `IN_PROGRESS` `Verification Cadence`:
`AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/add-discount-codes-to-checkout-totals-20260924T083000Z-3c9e5a1f.md`
- `Architecture`: `.standards/docs/specs/add-discount-codes-to-checkout-totals-20260924T083000Z-3c9e5a1f.md`
- `Request`: `Add discount codes to checkout totals.`

## Build Steps

### DEV-001 — Discount code lookup and amount helpers

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `AC-001, AC-002`

**Goal**

Provide the pure helpers that find a code and compute its discount.

**Affected Area**

`src/discounts.js` (new).

**Expected Outcome**

`normalizeCode`, `findDiscount`, and `discountAmount` are exported; percent
amounts round to whole cents and fixed amounts are capped at the subtotal.

**Self-Check**

`node --test test/totals.test.js` in the project root with `src/discounts.js`
added: exit 0, 3 passes (existing totals behavior unchanged). Helpers exercised
with `node --input-type=module -e` on a 3000-cent subtotal: a 10% percent code
gave 300 and a 500-cent fixed code gave 500; ` welcome10 ` matched `WELCOME10`.

### DEV-002 — Apply the discount in computeTotals

`Status`: `IN_PROGRESS` `Depends On`: `DEV-001` `Acceptance`: `AC-001, AC-002`

**Goal**

Load the code list and apply a supplied code when computing totals.

**Affected Area**

`src/totals.js`, `src/discount-codes.json` (new).

**Expected Outcome**

`computeTotals(items, code)` returns `{ subtotal, discount, tax, total }` with
tax charged on the discounted amount; calls without a code behave as before.

**Self-Check**

Not yet run.

### DEV-003 — Reject unknown and expired codes

`Status`: `PENDING` `Depends On`: `DEV-002` `Acceptance`: `AC-003`

**Goal**

Refuse codes that are not in the list or have expired.

**Affected Area**

`src/discounts.js`, `src/totals.js`.

**Expected Outcome**

`computeTotals` throws `DiscountError` naming the code, comparing `expires`
with the order date, and returns no totals in that case.

**Self-Check**

Not yet run.

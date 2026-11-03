<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: add-a-free-shipping-threshold-to-the-20260924T090000Z-3e8a51c7
-->

# Development Plan

`Cycle`: `add-a-free-shipping-threshold-to-the-20260924T090000Z-3e8a51c7`
`Mode`: `AUTONOMOUS` `User Style`: `NONE` `User Style Locked`: `true`
`Status`: `COMPLETE` `Verification Cadence`: `AFTER_IMPLEMENTATION`
`Current Increment`: `NONE`

## Implementation Contract

- Scope:
  `.standards/docs/scope/add-a-free-shipping-threshold-to-the-20260924T090000Z-3e8a51c7.md`
- Architecture:
  `.standards/docs/specs/add-a-free-shipping-threshold-to-the-20260924T090000Z-3e8a51c7.md`
- Request: Add a free-shipping threshold to the shipping rate calculator.

## Build Steps

### DEV-001 — Optional, validated threshold in shipping settings

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `AC-003`

**Goal**

Settings carry an optional `freeShippingThreshold` that defaults to `null` and
is rejected when invalid.

**Affected Area**

`src/settings.js` (MODIFY).

**Expected Outcome**

`parseSettings({})` yields `freeShippingThreshold` null; negative, non-finite,
or non-number values throw a `RangeError` naming `freeShippingThreshold`.
Existing settings without the key parse as before.

**Self-Check**

- In the project root, against the working tree on top of commit
  ${COMMIT:Record audit, scope, and design for free-shipping threshold} with
  src/settings.js at blob ${BLOB:src/settings.js}: ran
  `node --test test/shipping.test.js test/settings.test.js test/quote.test.js`;
  exit 0, 8 tests, 8 pass, 0 fail.
- Sanity check with `node --input-type=module -e` importing
  `./src/settings.js`: a threshold of -1 and of the string 50 each threw
  RangeError mentioning freeShippingThreshold; a threshold of 50 and an empty
  object parsed. Node 22.

### DEV-002 — Free shipping at or above the threshold

`Status`: `DONE` `Depends On`: `DEV-001` `Acceptance`: `AC-001, AC-002`

**Goal**

`shippingCost` returns 0 when a threshold is set and the rounded subtotal
reaches it; otherwise the weight-based rate is unchanged.

**Affected Area**

`src/shipping.js` (MODIFY). `src/quote.js` needs no change.

**Expected Outcome**

With a threshold of 50, an order with subtotal 50 or more ships for 0, and an
order with subtotal 49.99 is priced by weight. Without a threshold every order
is priced exactly as before.

**Self-Check**

- In the project root, against the working tree on top of commit
  ${COMMIT:Record audit, scope, and design for free-shipping threshold} with
  src/shipping.js at blob ${BLOB:src/shipping.js}: ran
  `node --test test/shipping.test.js test/settings.test.js test/quote.test.js`;
  exit 0, 8 tests, 8 pass, 0 fail (existing behavior unchanged).
- Sanity check with `node --input-type=module -e`: threshold 50 with subtotal
  50 gave 0, subtotal 49.99 at 1.5 kg gave 6.9, no threshold at 1.5 kg gave
  6.9. Node 22.

## Plan Notes

Project references loaded: NONE. New tests for the threshold are left to
Tester.

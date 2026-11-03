<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: free-shipping-threshold-20260924T090000Z-3c9e5a71
-->

# Development Plan

`Cycle`: `free-shipping-threshold-20260924T090000Z-3c9e5a71` `Mode`:
`AUTONOMOUS` `User Style`: `NONE` `User Style Locked`: `true` `Status`:
`COMPLETE` `Verification Cadence`: `AFTER_IMPLEMENTATION` `Current Increment`:
`NONE`

## Implementation Contract

- Scope: `.standards/docs/scope/free-shipping-threshold-20260924T090000Z-3c9e5a71.md`
- Architecture: `.standards/docs/specs/free-shipping-threshold-20260924T090000Z-3c9e5a71.md`
- Request: optional free-shipping threshold for domestic and regional orders.

## Build Steps

### DEV-001 — Optional free-shipping threshold in shippingCost

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `AC-001, AC-002`

**Goal**

`shippingCost` accepts an options object whose `freeShippingThreshold` waives
the charge for eligible zones, and rejects invalid thresholds.

**Affected Area**

`src/rates.js`.

**Expected Outcome**

Domestic and regional orders whose `orderTotal` is at or above the threshold
cost 0; international orders and orders below the threshold are charged as
before; calls without options are unchanged; a negative or non-finite
threshold throws `RangeError`.

**Self-Check**

Ran `node --test test/rates.test.js` from the repository root on the saved
`src/rates.js` committed with this plan: exit 0, 4 tests, 4 passed, so the
existing zone and input behavior is unchanged. Spot-checked the new option
with `node -e` calls on the same content: domestic 2.3 kg with orderTotal 60
and threshold 50 returned 0; the same order with orderTotal 49.99 returned
7.8; international 0.5 kg with orderTotal 200 returned 18.4; a threshold of -1
threw RangeError. Developer self-check only, not formal verification.

## Plan Notes

- Project references loaded: NONE.
- AC-003 is README documentation for the documentation phase; no build step.

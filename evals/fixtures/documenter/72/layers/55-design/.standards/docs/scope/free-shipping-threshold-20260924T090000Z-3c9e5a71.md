<!-- STANDARDS
Artifact: SCOPE
Cycle: free-shipping-threshold-20260924T090000Z-3c9e5a71
-->

# Free Shipping Threshold

## Goal

Let the checkout service waive shipping on orders at or above a configured
order total, and make the option discoverable to developers who use the
library.

## Constraints

- Calls to `shippingCost` that do not supply a threshold keep their current
  results.
- International shipments are never free.

## Non-goals

- Per-customer or promotional discounts.
- Changing any zone's base or per-kilogram rate.

## Work

### 1. Threshold option

**Intent:** Checkout wants to offer free shipping on larger orders without
duplicating rate logic.

**Done when:**

- `AC-001`: When a free-shipping threshold is supplied and the order total is
  equal to or greater than it, domestic and regional shipments cost 0;
  international shipments and orders below the threshold are charged normally,
  and calls without a threshold are unchanged.
- `AC-002`: A threshold that is negative or not a finite number is rejected
  with a `RangeError`.

**Depends on:** None

### 2. Developer documentation

**Intent:** Developers integrating the library can find and use the option
without reading the source.

**Done when:**

- `AC-003`: The README explains how to supply the threshold, which zones it
  applies to, and how invalid values are handled.

**Depends on:** 1

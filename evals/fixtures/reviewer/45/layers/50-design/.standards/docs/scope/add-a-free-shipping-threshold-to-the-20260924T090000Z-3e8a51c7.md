<!-- STANDARDS
Artifact: SCOPE
Cycle: add-a-free-shipping-threshold-to-the-20260924T090000Z-3e8a51c7
-->

# Free-Shipping Threshold

## Goal

Let a shop waive shipping on larger orders: when an order's item subtotal
reaches a configured amount, shipping is free. Orders below that amount, and
shops that configure no amount, keep today's weight-based rate.

## Constraints

- The threshold is optional and lives in the existing shipping settings.
  Settings files without it must keep loading and pricing exactly as before.
- Amounts are in the settings currency; there is no currency conversion.

## Non-goals

- Per-region or per-customer thresholds.
- Changes to the weight-based rate formula.
- Changes to the values in the bundled `config/shipping.json`.

## Work

### 1. Free shipping at or above a threshold

**Intent:** Larger orders ship free once the shop opts in, without changing
prices for anyone else.

**Done when:**

- `AC-001`: An order whose item subtotal is equal to or greater than the
  configured free-shipping threshold is charged 0 shipping.
- `AC-002`: When no threshold is configured, or the order's item subtotal is
  below it, the shipping cost equals the existing weight-based rate.

**Depends on:** None

### 2. Threshold validation

**Intent:** A mistyped threshold must fail loudly instead of silently changing
prices.

**Done when:**

- `AC-003`: A configured threshold that is negative or not a number is rejected
  when the settings are parsed, with a `RangeError` whose message names
  `freeShippingThreshold`.

**Depends on:** None

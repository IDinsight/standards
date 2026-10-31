<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: add-a-free-shipping-threshold-to-the-20260924T090000Z-3e8a51c7
-->

# Technical Design

## Context

The scope adds an optional free-shipping threshold to the existing
weight-based calculator. Settings are parsed and validated in
`src/settings.js`, shipping is priced in `src/shipping.js`, and
`src/quote.js` combines them with the bundled settings. No project references
apply.

## Decision

- Add an optional `freeShippingThreshold` setting: a number in the settings
  currency, or `null`. It defaults to `null`, so settings without it behave
  exactly as before.
- Validate it in `parseSettings` next to the existing rate checks. Any value
  other than `null` or a finite non-negative number throws a `RangeError` whose
  message names `freeShippingThreshold`.
- In `shippingCost`, when a threshold is set and the cent-rounded
  `subtotal(order)` is greater than or equal to it, return 0 before the weight
  calculation. Otherwise keep the existing formula unchanged.

## Acceptance Coverage

- `AC-001`: inclusive threshold comparison on the rounded subtotal in
  `shippingCost`.
- `AC-002`: `null` default and the unchanged weight-based path below the
  threshold.
- `AC-003`: `parseSettings` validation of `freeShippingThreshold`.

## Interfaces and Contracts

- Settings gain `freeShippingThreshold` (number or `null`, default `null`). The
  signatures of `parseSettings`, `loadSettings`, `shippingCost`, and `quote`
  are unchanged.
- `shippingCost` still accepts plain settings objects that lack the key and
  treats them as having no threshold.

## Technical Acceptance Criteria

- `AC-001`: For a configured threshold T, `shippingCost` returns 0 whenever
  `subtotal(order) >= T`.
- `AC-002`: With no threshold, or with `subtotal(order) < T`, `shippingCost`
  returns the same value as before this change.
- `AC-003`: `parseSettings` throws a `RangeError` mentioning
  `freeShippingThreshold` for negative, non-finite, or non-number values, and
  accepts `null` or omission.

## Build Plan

1. MODIFY `src/settings.js`: default and validation for the threshold.
2. MODIFY `src/shipping.js`: threshold check at the start of `shippingCost`.

## Risks and Follow-up

- Floating-point subtotals: compare the cent-rounded subtotal so an order that
  totals exactly the threshold qualifies.

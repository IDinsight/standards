<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: free-shipping-threshold-20260924T090000Z-3c9e5a71
-->

# Technical Design

## Context

`shippingCost` in `src/rates.js` computes a zone base charge plus a
per-kilogram charge. The order object currently carries `zone` and
`weightKg`. No project references apply.

## Decision

Add an optional second argument, `options`, with an optional numeric
`freeShippingThreshold`, and read an optional `orderTotal` from the order.
Keeping the threshold out of the order object leaves the order a plain
description of the parcel and lets checkout pass one shared options object.

## Acceptance Coverage

- `AC-001`: `shippingCost(order, options = {})`; when
  `options.freeShippingThreshold` is defined and the zone is `domestic` or
  `regional`, an `orderTotal` (default 0) equal to or greater than the
  threshold returns 0. Otherwise the existing calculation runs unchanged.
- `AC-002`: validation of `freeShippingThreshold` before any cost is computed;
  a negative or non-finite value (including non-numbers) throws `RangeError`.
- `AC-003`: No architectural impact — README documentation is owned by the
  documentation phase.

## Interfaces and Contracts

- `shippingCost(order, options = {})`
  - `order.zone`: `domestic`, `regional`, or `international` (unchanged).
  - `order.weightKg`: number greater than 0 (unchanged).
  - `order.orderTotal`: optional number, default 0.
  - `options.freeShippingThreshold`: optional finite number, 0 or greater.
- Return value: cost rounded to cents, or 0 when free shipping applies.

## Technical Acceptance Criteria

- `AC-001`: International shipments are charged regardless of `orderTotal`;
  omitting `options` gives results identical to the current release.
- `AC-002`: The threshold check uses `Number.isFinite` and rejects values
  below 0.

## Build Plan

1. MODIFY `src/rates.js`: accept `options`, validate the threshold, and return
   0 for eligible zones at or above it.

## Risks and Follow-up

- Floating-point order totals are compared directly; checkout already passes
  totals rounded to cents.

<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: add-invoice-discounts-20260922T141500Z-3c9e5a71
-->

# Technical Design

## Context

Totals are computed in integer cents by `computeTotals` in `src/totals.js`;
`renderInvoice` in `src/format.js` prints the invoice from those totals (see
`.standards/CONTEXT.md`). No project references apply.

## Decision

Add an optional `discountCents` option to `computeTotals` and an optional
`discountCents` field on the invoice object passed to `renderInvoice`. The
discount is subtracted from the subtotal before tax. Validation stays in
`computeTotals` so every caller gets the same rule.

## Acceptance Coverage

- `AC-001`: `computeTotals` subtracts `discountCents` from the subtotal and
  computes tax on the result.
- `AC-002`: `computeTotals` throws `RangeError` for a discount that is not an
  integer, is negative, or exceeds the subtotal.
- `AC-003`: `renderInvoice` inserts a `Discount  -X.XX` row between `Subtotal`
  and `Tax` only when the discount is nonzero.

## Interfaces and Contracts

- `computeTotals(lines, { taxRate = 0, discountCents = 0 })` returns
  `{ subtotal, discount, tax, total }` in integer cents, with
  `tax = Math.round((subtotal - discount) * taxRate)`.
- `renderInvoice({ lines, taxRate, discountCents })` returns newline-joined
  text; `discountCents` is optional and the existing rows are unchanged.

## Technical Acceptance Criteria

- `AC-001`: `total === subtotal - discount + tax` for every valid discount.
- `AC-002`: no totals object is returned when validation fails.
- `AC-003`: output for an invoice without `discountCents` is identical to the
  current output.

## Build Plan

1. MODIFY `src/totals.js`: discount option and validation.
2. MODIFY `src/format.js`: pass the discount through and print its row.

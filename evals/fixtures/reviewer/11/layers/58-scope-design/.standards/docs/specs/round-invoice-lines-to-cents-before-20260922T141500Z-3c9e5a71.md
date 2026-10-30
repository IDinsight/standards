<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: round-invoice-lines-to-cents-before-20260922T141500Z-3c9e5a71
-->

# Technical Design

## Context

`src/totals.js` currently rounds every amount to two decimals (tentative work
from this cycle, see `.standards/CONTEXT.md`). `summarize` in `src/invoice.js`
is the public entry point and calls `invoiceTotal(invoice)`.

## Decision

Add `src/currencies.js` holding a fixed minor-unit table and a rounding helper.
`invoiceTotal` looks up the invoice currency once, rejects unknown codes before
any arithmetic, and passes the currency to `lineTotal`.

## Acceptance Coverage

- `AC-001`: `MINOR_UNITS` and `roundToMinorUnit(amount, currency)` in
  `src/currencies.js`; `lineTotal(line, currency)` rounds with it.
- `AC-002`: `invoiceTotal` sums the rounded line totals and rounds the sum with
  the same helper to absorb floating-point error.
- `AC-003`: `invoiceTotal` throws `UnsupportedCurrencyError`, whose message
  includes the code, when `MINOR_UNITS` has no entry; `summarize` lets it
  propagate.

## Components

- `src/currencies.js` — minor-unit table, rounding helper, error class.
- `src/totals.js` — line and invoice arithmetic using the helper.

## Interfaces and Contracts

- `MINOR_UNITS = { USD: 2, EUR: 2, JPY: 0, KWD: 3 }`.
- `roundToMinorUnit(amount, currency)` returns
  `Math.round(amount * 10 ** d) / 10 ** d` with `d = MINOR_UNITS[currency]`.
- `lineTotal(line, currency)`; `invoiceTotal(invoice)` reads
  `invoice.currency`.
- `UnsupportedCurrencyError extends Error`, `code` property set to the
  rejected currency.

## Technical Acceptance Criteria

- `AC-001`: `lineTotal` never returns more decimals than the currency's minor
  unit.
- `AC-002`: `invoiceTotal` equals `roundToMinorUnit` of the sum of the
  `lineTotal` results.
- `AC-003`: validation happens before any line is totalled.

## Build Plan

1. Add the currency table and rounding helper.
2. Route `lineTotal` and `invoiceTotal` through it.
3. Reject unsupported currencies in `invoiceTotal`.

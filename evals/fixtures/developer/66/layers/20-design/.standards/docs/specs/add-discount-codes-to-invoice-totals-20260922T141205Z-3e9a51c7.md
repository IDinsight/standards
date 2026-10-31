<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: add-discount-codes-to-invoice-totals-20260922T141205Z-3e9a51c7
-->

# Technical Design

## Context

The command computes totals in integer cents (`src/totals.js`) and keeps all
process access in `bin/invoice.js`; `src/cli.js` returns a result object
(`.standards/CONTEXT.md`). Existing output lines must not change.

## Decision

- Discount table: `config/discounts.json`, a JSON array of objects with `code`,
  `percent` (whole number 1 to 100), and `expires` (`YYYY-MM-DD`). Codes match
  case-insensitively.
- `src/discounts.js`: parses and validates the table and looks up an entry by
  code. A code is usable through its `expires` date inclusive, compared with
  the current UTC date supplied by the caller.
- `src/totals.js`: `orderTotals(order, discount)` takes an optional entry.
  `discountCents = Math.round(subtotalCents * percent / 100)`; tax is computed
  on `subtotalCents - discountCents`; the result adds `discountCents` (0
  without a code).
- `src/cli.js`: `run(argv, { readFile, today, discountsPath })`. `--code
  <CODE>` may appear after the order file. `bin/invoice.js` resolves the table
  path from the package root and passes today's UTC date.

## Acceptance Coverage

- `AC-001`: table lookup in `src/discounts.js`, discount arithmetic in
  `orderTotals`, and a `Discount (CODE): -$X.YY` line printed between Subtotal
  and Tax.
- `AC-002`: tax computed on the discounted subtotal with `Math.round`.
- `AC-003`: unknown code prints `invoice: unknown discount code CODE`; expired
  code prints `invoice: discount code CODE expired on YYYY-MM-DD`; both on
  stderr with exit status 2 and empty stdout, before any totals are computed.
- `AC-004`: without `--code`, `run` takes the existing path and prints the same
  three lines.

## Technical Acceptance Criteria

- `AC-001`, `AC-002`: all arithmetic stays in integer cents; only output is
  formatted.
- `AC-003`: the table is read only when `--code` is given.

## Build Plan

1. `config/discounts.json` (CREATE) and `src/discounts.js` (CREATE).
2. `src/totals.js` (MODIFY) for the optional discount.
3. `src/cli.js` and `bin/invoice.js` (MODIFY) for the flag, rejection, and the
   Discount line.

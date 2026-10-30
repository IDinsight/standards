# Project Context

## Project Baseline

- `invoices` is a small Node.js library that computes invoice line totals and
  invoice totals and builds an invoice summary. Amounts are plain numbers in
  major currency units; each invoice carries an ISO 4217 `currency` code.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no runtime or
  development dependencies.

## Structure and Boundaries

- `src/totals.js` — `lineTotal(line)` and `invoiceTotal(invoice)`.
- `src/invoice.js` — `summarize(invoice)` returns
  `{ number, currency, lineCount, total }`; the only caller of `invoiceTotal`.
- `test/totals.test.js` — `node:test` suite for both modules.

## Commands

- `node --test test/totals.test.js` — runs the suite from the project root; the
  `test` script in `package.json` runs the same command.

## Conventions and Constraints

- The `summarize` result shape is the public contract of the library.
- Amounts are JavaScript numbers in major units; there is no decimal library.

## Testing and Verification Baseline

- Three tests cover multiplication, summing, and the summary shape. None cover
  rounding or currency handling.

## Relevant Existing Behavior

- At the pre-cycle baseline, `lineTotal` returned the unrounded product,
  `invoiceTotal` the unrounded sum, and `currency` was passed through without
  validation.

## Active-Cycle Non-Baseline Work

- `Cycle: round-invoice-lines-to-cents-before-20260922T141500Z-3c9e5a71; src/totals.js`
  — `toCents` rounding of line totals and the invoice total to two decimals,
  added during this cycle's expedited phase. Tentative; not established
  baseline.

## Evidence

- `git log` — pre-cycle baseline is `${COMMIT:Initial invoice totals module}`;
  `${COMMIT:Round invoice lines to cents before summing}` holds the expedited
  change.
- `node --test test/totals.test.js` — exit 0, 3 passed on the current tree.

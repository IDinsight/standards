# Project Context

## Project Baseline

- `invoice-tools` is a small Node.js command-line tool that prints an invoice
  summary for Northwind Supplies. Audited at
  `${COMMIT:Add invoice summary report}`.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no
  dependencies.

## Structure and Boundaries

- `src/totals.js` — `lineAmount` and `invoiceTotals` (subtotal, tax, and total
  as floating-point numbers).
- `src/report.js` — `summaryLines(invoices, settings)` returns one text line per
  invoice.
- `src/cli.js` — entry point; loads settings and `data/invoices.json` (or a path
  argument) and prints the summary and a grand total.
- `src/config.js` — `loadSettings()` reads `config/settings.json` and merges it
  over defaults for `company` and `taxRate`; other keys pass through as read.
- `config/settings.json` — company name and tax rate.

## Commands

- `npm test` — runs `node --test test/totals.test.js test/report.test.js`.
- `node src/cli.js` — prints the summary for the sample data.

## Conventions and Constraints

- Amounts are printed with `toFixed(2)` and no currency.

## Testing and Verification Baseline

- `test/totals.test.js` covers `lineAmount` and `invoiceTotals`;
  `test/report.test.js` checks the first summary line's invoice number,
  customer, and amount.

## Evidence

- `git log`, the source files above, and `npm test` (exit 0, 3 tests passed)
  at the audited commit.

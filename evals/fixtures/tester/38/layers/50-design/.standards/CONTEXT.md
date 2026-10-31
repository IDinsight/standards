# Project Context

## Project Baseline

- Small Node.js library that prices order lines and formats the plain-text
  invoice printed for each order.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`type: module` in `package.json`),
  no runtime or development dependencies.

## Structure and Boundaries

- `src/pricing.js` — `lineTotal(line)` and `orderTotal(lines)`; a line is
  `{ sku, unitCents, quantity }`.
- `src/invoice.js` — `formatInvoice(order)` builds the printed invoice text from
  the totals in `src/pricing.js`.
- `test/` — `node:test` suites, one per source file.

## Commands

- `npm test` — runs `node --test test/pricing.test.js test/invoice.test.js`.

## Conventions and Constraints

- Money is integer cents; formatting to two decimals happens only in
  `src/invoice.js`.
- Invoice rows separate columns with two spaces.

## Testing and Verification Baseline

- `test/pricing.test.js` covers a plain line total and an order sum.
- `test/invoice.test.js` covers one invoice row plus the total row.

## Relevant Existing Behavior

- `lineTotal` is unit price times quantity with no discounts; `orderTotal` sums
  `lineTotal` over the lines.
- The invoice prints `Invoice <number>`, one row per line, then
  `Total  <amount>`.

## Evidence

- `src/pricing.js`, `src/invoice.js`, `test/`, `package.json`.

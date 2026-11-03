# Project Context

## Project Baseline

- `invoicing` is a small Node.js library that computes invoice totals and
  renders a plain-text invoice. It has no HTTP layer and no persistence.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no runtime or
  development dependencies.

## Structure and Boundaries

- `src/totals.js` — `lineTotal` and `computeTotals`; all amounts are integer
  cents.
- `src/format.js` — `renderInvoice`, which formats cents as `X.XX`.
- `test/totals.test.js` — `node:test` suite for both modules.

## Commands

- `npm test` — runs `node --test test/totals.test.js`.

## Conventions and Constraints

- Money is integer cents everywhere; rounding happens only where tax is
  computed (`Math.round`).

## Testing and Verification Baseline

- Three tests cover `lineTotal`, tax on the subtotal, and the rendered invoice
  layout.

## Relevant Existing Behavior

- `renderInvoice` prints item rows, then `Subtotal`, `Tax`, and `Total` rows.

## Evidence

- `src/totals.js`, `src/format.js`, `test/totals.test.js`, `package.json`.

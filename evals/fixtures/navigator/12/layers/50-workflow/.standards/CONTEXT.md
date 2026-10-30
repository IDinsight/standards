# Project Context

## Project Baseline

- Small library that computes checkout totals in integer cents. No storage,
  network, or UI; callers pass cart line items.

## Stack and Tooling

- Node 22, plain JavaScript ES modules (`"type": "module"`), no dependencies.

## Structure and Boundaries

- `src/cart.js` — validates line items and computes line totals.
- `src/totals.js` — `computeTotals(items)` returns `{ subtotal, tax, total }`
  with an 8% tax rate rounded to whole cents.

## Commands

- `npm test` (`node --test test/totals.test.js`) — runs the test suite.

## Testing and Verification Baseline

- `test/totals.test.js` covers subtotal and tax, the empty cart, and invalid
  quantities with `node:test`.

## Evidence

- `src/totals.js`, `src/cart.js`, `test/totals.test.js`, `package.json`.

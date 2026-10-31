# Project Context

## Project Baseline

- `ordercalc` is a small ES module library used by the checkout service to
  compute order totals.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no
  dependencies.

## Structure and Boundaries

- `src/totals.js` — `orderTotals(items)`: subtotal, flat 8% tax, and total,
  each rounded to cents.
- `test/` — `node:test` suites.

## Commands

- `npm test` — runs `node --test` with the test files listed explicitly in
  `package.json`.

## Conventions and Constraints

- Amounts are rounded to cents with `Math.round(amount * 100) / 100` after each
  step.
- Callers pass only items today and read the result by property.

## Testing and Verification Baseline

- `test/totals.test.js` covers subtotal, tax, and total for one cart.

## Evidence

- `src/totals.js`, `test/totals.test.js`, `package.json`, `README.md`.

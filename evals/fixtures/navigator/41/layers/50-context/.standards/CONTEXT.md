# Project Context

## Project Baseline

- `order-tools` is a small Node.js utility package for reading order files.
  There is no export format yet.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no runtime or
  development dependencies.

## Structure and Boundaries

- `src/orders.js` — `loadOrders(file)` reads a JSON array of orders.
- `src/money.js` — `formatCents(cents)` turns integer cents into a decimal
  string; throws `TypeError` for non-integers.
- `test/` — `node:test` suites.

## Commands

- `npm test` — runs `node --test` with the test files listed in package.json.

## Conventions and Constraints

- Money is stored as integer cents (`totalCents`, `priceCents`) and must not be
  converted through floating point.
- `placedAt` values arrive as ISO 8601 strings with arbitrary offsets.

## Testing and Verification Baseline

- `test/money.test.js` covers `formatCents` (2 tests). Nothing covers
  `loadOrders`.

## Evidence

- `package.json`, `src/*.js`, `test/money.test.js`, `README.md`.

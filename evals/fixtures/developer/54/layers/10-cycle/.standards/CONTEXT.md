# Project Context

## Project Baseline

- `stockroom` is a small Node.js library of inventory helpers used by the
  warehouse tools. It loads item records, adjusts quantities, and totals stock.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no runtime or
  development dependencies.

## Structure and Boundaries

- `src/inventory.js` — `loadItems`, `adjustQuantity`, `totalUnits`; pure
  functions over an array of item objects `{ sku, name, quantity, reorderLevel }`.
- `test/` — `node:test` suites.

## Commands

- `npm test` (runs `node --test test/inventory.test.js`) — the existing test
  suite; run from the project root.

## Conventions and Constraints

- Helpers are pure: they return new arrays and objects and never mutate their
  input.
- `reorderLevel` defaults to 0 when a record omits it.

## Testing and Verification Baseline

- `test/inventory.test.js` covers `loadItems`, `adjustQuantity`, and
  `totalUnits` (3 tests, all passing at audit time).
- The `test` script lists test files explicitly; a new test file runs under
  `npm test` only once it is added there.

## Evidence

- `package.json`, `src/inventory.js`, `test/inventory.test.js`.
- `node --test test/inventory.test.js` in the project root — 3 passed.

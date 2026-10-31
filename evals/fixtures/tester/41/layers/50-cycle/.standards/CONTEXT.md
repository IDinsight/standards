# Project Context

## Project Baseline

- `inventory-tools` is a small library for reading warehouse stock exports.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no external
  dependencies.

## Structure and Boundaries

- `src/inventory.js` — CSV parsing (`parseInventory`) and totals
  (`totalUnits`). Items have `sku`, `name`, `quantity`, `reorderLevel`.
- `test/` — node:test suites.

## Commands

- `npm test` (runs `node --test test/inventory.test.js`) — the project test
  suite.

## Testing and Verification Baseline

- `test/inventory.test.js` covers parsing and totals; no other tests exist.

## Evidence

- `package.json`, `src/inventory.js`, `test/inventory.test.js`.

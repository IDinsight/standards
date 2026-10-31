# Project Context

## Project Baseline

- `stockroom` is a small in-memory inventory library used by the stockroom team.
  It has no runtime dependencies and no persistence layer.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no build step.

## Structure and Boundaries

- `src/inventory.js` — inventory as a `Map` keyed by SKU; `createInventory`,
  `addItem`, `adjustQuantity`, `listItems` (sorted by SKU).
- `src/report.js` — read-only reports over an inventory; currently `stockSummary`.
- `test/` — `node:test` suites, one file per module.

## Nearest Analogues

- `src/report.js` `stockSummary` — reads items through `listItems`, returns a plain
  object, never mutates the inventory; covered by `test/report.test.js`.

## Commands

- `npm test` — runs `node --test test/inventory.test.js test/report.test.js` from
  the project root. New test files must be added to this script explicitly.

## Conventions and Constraints

- Items are `{ sku, name, quantity, reorderLevel }`; `reorderLevel` is a number or
  `null` when unset. `quantity` never goes below zero.
- Modules use named exports declared inline.

## Testing and Verification Baseline

- 6 tests across two files, all passing on the committed project.

## Evidence

- `src/inventory.js`, `src/report.js`, `package.json`, `npm test` output.

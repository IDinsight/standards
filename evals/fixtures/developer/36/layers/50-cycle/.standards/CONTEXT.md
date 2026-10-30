# Project Context

## Project Baseline

- `stockroom` is a small Node.js CLI that reads a stock CSV and prints each
  item plus a total-units line.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no external
  dependencies.

## Structure and Boundaries

- `src/inventory.js` — CSV parsing (`parseInventory`) and totals (`totalUnits`).
- `src/cli.js` — argument handling and output; exits 2 on usage errors.
- `data/sample.csv` — sample stock sheet used for manual runs.

## Commands

- `node --test test/inventory.test.js` — the full test suite.
- `node src/cli.js data/sample.csv` — manual run against the sample sheet.

## Conventions and Constraints

- Output lines are comma-separated `sku,name,qty`; the listing ends with
  `total,<units>`.
- Usage errors go to stderr with exit status 2.

## Testing and Verification Baseline

- `node:test` tests in `test/inventory.test.js` cover parsing and totals; the
  CLI itself has no automated tests.

## Evidence

- `src/cli.js`, `src/inventory.js`, `test/inventory.test.js`, `README.md`.

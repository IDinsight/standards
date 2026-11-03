# Project Context

## Project Baseline

- `stockroom` is a small Node CLI that prints a low-stock report from an
  inventory JSON file. Every item is compared with one reorder level,
  `DEFAULT_THRESHOLD = 5`.

## Stack and Tooling

- Node 22, plain JavaScript ES modules (`"type": "module"`), no dependencies.

## Structure and Boundaries

- `src/stock.js` — `lowStock(items, threshold)`: keeps items whose quantity is
  at or below the threshold.
- `src/report.js` — `formatReport(items, threshold)`: tab-separated rows, or
  `No items below reorder level.` when nothing qualifies.
- `src/cli.js` — reads the inventory path from argv and prints the report.
- `data/inventory.sample.json` — sample inventory used for manual runs.

## Commands

- `npm test` — runs `node --test test/stock.test.js test/report.test.js`.
- `node src/cli.js data/inventory.sample.json` — prints the sample report.

## Testing and Verification Baseline

- `node:test` with `node:assert/strict` in `test/`; 3 tests, all passing at
  the baseline commit.

## Relevant Existing Behavior

- The comparison is inclusive: an item at exactly the reorder level is listed.
- Report rows keep the inventory file's order.
- The CLI takes a single inventory path; with no argument it prints usage and
  exits 2.

## Evidence

- `src/stock.js`, `src/report.js`, `src/cli.js` — behavior above.
- `npm test` — exit 0, 3 passing.

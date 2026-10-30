# Project Context

## Project Baseline

- `stockroom` is a small Node.js command-line tool that reads a comma-separated
  inventory file and prints a stock report sorted by SKU.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no external
  dependencies and no build step.

## Structure and Boundaries

- `src/inventory.js` — parses inventory rows (`parseItem`, `parseInventory`);
  rejects malformed rows with an `Error`.
- `src/report.js` — formats the stock report (`stockReport`).
- `src/cli.js` — reads a file path (default `data/stock.csv`) and prints the
  report.
- `data/stock.csv` — sample inventory in the three-column format.
- `test/` — `node:test` suites.

## Commands

- `npm test` — runs `node --test test/inventory.test.js test/report.test.js`.
- `node src/cli.js data/stock.csv` — prints the report for the sample file.

## Conventions and Constraints

- Rows are `sku, name, quantity`; fields are trimmed; blank lines and lines
  starting with `#` are skipped.
- Item lines join SKU, name, and quantity with two spaces. The last line is a
  summary beginning with `<N> items`.
- Malformed rows throw a plain `Error` whose message starts with
  `invalid inventory row`.

## Testing and Verification Baseline

- 4 tests in two files, all passing. They cover three-column parsing, comment
  and blank-line skipping, negative-quantity rejection, SKU sort order, and the
  item-count summary.

## Evidence

- `package.json`, `src/*.js`, `test/*.test.js`.
- `node --test test/inventory.test.js test/report.test.js` in the project root:
  exit 0, 4 passed.

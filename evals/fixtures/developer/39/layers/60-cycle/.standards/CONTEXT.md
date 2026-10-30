# Project Context

## Project Baseline

- `stock` is a small Node.js command-line tool that reads the warehouse
  inventory CSV and prints it as an aligned table. It has one command, `list`.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no runtime or
  dev dependencies.

## Structure and Boundaries

- `src/inventory.js` — parses the CSV (`sku,name,qty,reorderAt`) into item
  objects; `qty` and `reorderAt` are numbers.
- `src/format.js` — `formatTable(rows, columns)` renders aligned plain-text
  tables.
- `src/cli.js` — argument handling and output; usage errors print to stderr and
  set exit code 1.

## Commands

- `npm test` (`node --test test/inventory.test.js`) — runs the existing tests.
- `node src/cli.js list data/inventory.csv` — prints the sample inventory.

## Conventions and Constraints

- Named exports only. Modules in `src/` are pure apart from file reading in
  `loadInventory` and console output in `cli.js`.

## Testing and Verification Baseline

- `test/inventory.test.js` covers CSV parsing (comments, blank lines, trimming)
  and `formatTable` alignment. The CLI itself has no automated tests.

## Evidence

- `src/*.js`, `test/inventory.test.js`, `package.json`, `README.md`.

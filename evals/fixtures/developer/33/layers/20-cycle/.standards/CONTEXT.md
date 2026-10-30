# Project Context

## Project Baseline

- `stock` is a small Node.js command-line helper for the warehouse inventory
  file. It currently offers one command, `list`.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no runtime or
  development dependencies.

## Structure and Boundaries

- `src/inventory.js` — loads `inventory.json`, normalizes items (`sku`, `name`,
  `quantity`), and formats the item table used by `list`.
- `src/cli.js` — `run(argv, out)` dispatches commands and returns the exit
  status; usage errors return 2.
- `test/inventory.test.js` — `node:test` suite for the loader, formatter, and
  CLI.

## Commands

- `npm test` (`node --test test/inventory.test.js`) — runs the test suite.

## Conventions and Constraints

- Named exports only; validation errors are thrown as `Error` with the
  offending SKU at the start of the message.
- The inventory file format is shared with other warehouse tooling and must not
  change.

## Testing and Verification Baseline

- 5 tests in `test/inventory.test.js`, all passing at the audit.

## Evidence

- `package.json`, `src/inventory.js`, `src/cli.js` — stack, structure, and CLI
  contract.
- `npm test` — test baseline.

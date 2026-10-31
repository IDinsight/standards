# Project Context

## Project Baseline

- `stockroom` is a small command-line tool that reads an inventory JSON file
  and prints item listings. It has `list` and `low` commands.
- The repository has no README or other project documentation; usage is known
  only from `src/cli.js`.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no runtime or
  development dependencies.

## Structure and Boundaries

- `src/inventory.js` — `loadItems(file)` reads and normalizes
  `{ "items": [...] }`; `lowStock(items, threshold)` filters by quantity.
- `src/cli.js` — `run(argv, out)` dispatches subcommands, writes to `out`, and
  parses the `--below <n>` option.
- `test/` — `node:test` suites with JSON data under `test/data/`.

## Nearest Analogues

- `src/cli.js` `low` command — the closest existing output command: it reuses
  `loadItems`, `lowStock`, and `--below`. A CSV export differs in output format
  and field escaping.

## Commands

- `npm test` (runs `node --test test/inventory.test.js`) — the full test suite;
  needs no network or services.

## Conventions and Constraints

- Commands write through the injected `out` stream so tests can capture output.
- Errors throw; the entry point prints the message and sets exit code 1.

## Testing and Verification Baseline

- `test/inventory.test.js` covers loading, the missing-array error, and
  `lowStock`. The CLI dispatcher has no tests yet.

## Relevant Existing Behavior

- `list` prints tab-separated `sku`, `name`, `quantity`; `low` prints `sku` and
  `quantity` for items below `--below` (default 5). Both must stay unchanged.

## Evidence

- `src/cli.js`, `src/inventory.js`, `test/inventory.test.js`, `package.json`.

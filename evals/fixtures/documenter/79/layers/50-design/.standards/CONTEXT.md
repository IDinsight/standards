# Project Context

## Project Baseline

- `stockroom` is a Node.js command-line tool that keeps a stock list in a JSON
  file and moves it in and out as CSV. It has two commands, `export` and
  `import`.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules, no runtime or development
  dependencies.

## Structure and Boundaries

- `src/cli.js` — argument parsing, command dispatch, and exit codes (0
  success, 1 import failure, 2 usage error).
- `src/export.js` — builds the export CSV from the item list.
- `src/import.js` — merges CSV rows into the item list.
- `src/csv.js` — CSV formatting and parsing shared by both commands.
- `src/store.js` — reads and writes the JSON stock list (`stockroom.json` by
  default, `--db` to override).
- `docs/export.md` — operator guide for the export command.

## Nearest Analogues

- `src/cli.js` import branch — the only existing option handling (`--replace`,
  `--db`) and the usage-error convention (stderr message, exit 2).

## Commands

- `npm test` — runs `node --test test/export.test.js test/import.test.js` from
  the project root.

## Conventions and Constraints

- `updatedAt` is written by `import` as an ISO 8601 UTC timestamp
  (`Date.prototype.toISOString`).
- Export output starts with the header `sku,name,quantity,updatedAt`; fields
  containing commas, quotes, or newlines are quoted.

## Testing and Verification Baseline

- `node:test` suites in `test/`; tests call module functions directly, and
  `run()` from `src/cli.js` with stub streams.

## Relevant Existing Behavior

- `stockroom export` prints every item; there is no filtering.

## Evidence

- `src/cli.js`, `src/export.js`, `src/import.js`, `test/export.test.js`,
  `README.md`, `docs/export.md`.

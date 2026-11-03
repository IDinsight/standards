# Project Context

## Project Baseline

- `inventory` is a small Node.js command-line tool for the warehouse inventory
  file. Its only command, `inventory export <file>`, writes the file's items to
  stdout as CSV.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`). No runtime or
  development dependencies and no build step.

## Structure and Boundaries

- `bin/inventory.js` — executable entry point; calls `run` and sets the exit
  code.
- `src/cli.js` — `run(argv, { stdout, stderr })` parses arguments and returns
  the exit code (0 success, 2 usage error).
- `src/inventory.js` — `loadItems(path)` reads the JSON inventory file and
  normalizes items to `sku`, `name`, `quantity` (number), and `location`.
- `src/export.js` — `COLUMNS` and `toCsv(items)` with RFC 4180-style quoting.
- `data/sample.json` — sample inventory used by the tests.

## Nearest Analogues

- `src/export.js` `toCsv` — the only existing output format; driven by
  `COLUMNS` and covered by `test/export.test.js`.

## Commands

- `npm test` — runs `node --test` with the explicit test file arguments listed
  in `package.json`.

## Conventions and Constraints

- `run` takes injectable `stdout`/`stderr` writers so tests capture output
  without spawning a process.
- The `test` script lists test files explicitly; a new test file must be added
  to it.

## Testing and Verification Baseline

- `node:test` with `node:assert/strict` in `test/`. `test/export.test.js`
  covers CSV quoting; `test/cli.test.js` covers exact CSV output for
  `data/sample.json` and the usage error.

## Relevant Existing Behavior

- CSV output for `data/sample.json` is asserted byte for byte in
  `test/cli.test.js`.
- User documentation is limited to `README.md`; the repository has no `docs/`
  folder.

## Evidence

- `package.json`, `src/`, `test/`, `data/sample.json`, and `README.md` at the
  current HEAD.

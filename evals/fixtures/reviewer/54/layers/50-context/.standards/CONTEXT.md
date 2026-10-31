# Project Context

## Project Baseline

- `ledger-tools` is a small Node.js repository with one command,
  `bin/summarize.js`, that prints summary statistics for one numeric column of
  a CSV file. There is no user guide; `README.md` names the project and the
  test command only.

## Stack and Tooling

- Node.js ES modules (`"type": "module"`), no runtime or development
  dependencies, no lockfile.
- Tests use the built-in `node:test` runner.

## Structure and Boundaries

- `bin/summarize.js` — argument parsing, output formatting, and exit codes.
- `src/csv.js` — `parseCsv(text)`: header row plus row objects, using plain
  comma splitting.
- `src/summarize.js` — `summarize(rows, column)`: count, skipped, sum, min,
  max, mean.
- `examples/sales.csv` — four-row sample file (`region,amount,units`).
- `test/` — unit tests for the library and CLI tests that spawn
  `bin/summarize.js`.

## Commands

- `npm test` — runs `node --test test/summarize.test.js test/cli.test.js` from
  the repository root.
- `node bin/summarize.js examples/sales.csv --column amount` — runs the command
  against the sample file.

## Conventions and Constraints

- File paths passed to the command are resolved from the current directory.
- Summaries go to standard output; error messages go to standard error.

## Testing and Verification Baseline

- `test/cli.test.js` asserts the text output for the `amount` column of the
  sample file, JSON output for `units`, exit 2 for an unknown column, and
  exit 1 for a missing `--column`.
- `test/summarize.test.js` covers header trimming, skipped cells, rounding, and
  the no-values case.

## Relevant Existing Behavior

- Quoted CSV fields are not supported; the parser splits on every comma.
- The command does not catch file read errors; Node's uncaught error ends the
  process.

## Evidence

- `bin/summarize.js`, `src/csv.js`, `src/summarize.js`, `test/cli.test.js`,
  `test/summarize.test.js`, and `examples/sales.csv` at commit
  `${COMMIT:Add summarize CLI for CSV columns}`.

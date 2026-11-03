# Project Context

## Project Baseline

- `ledger` is a small Node.js command-line tool that reads a CSV ledger
  (`date,amount,category`) and prints totals per category. Only the `summary`
  command exists.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no
  dependencies.

## Structure and Boundaries

- `src/entries.js` — parses and validates ledger CSV rows.
- `src/summary.js` — groups totals by category and formats them.
- `src/cli.js` — argument handling, exit codes, and output for
  `ledger summary`; `run()` returns the exit code and takes injectable writers.
- `data/sample.csv` — sample ledger used by the CLI tests.

## Commands

- `npm test` — runs `node --test` on the test files listed in `package.json`.
- `node src/cli.js summary data/sample.csv` — manual run from the project root.

## Conventions and Constraints

- Usage errors write to stderr and return exit status 2.
- Totals print as `category<TAB>amount` with two decimals, sorted by category.

## Testing and Verification Baseline

- `node:test` with explicit file arguments in the `test` script.
  `test/summary.test.js` covers parsing, totals, and formatting;
  `test/cli.test.js` covers summary output and the usage error.

## Evidence

- `package.json`, `src/*.js`, `test/*.test.js`, and `README.md` at
  `${COMMIT:Initial ledger CLI}`.

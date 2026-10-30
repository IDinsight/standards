# Project Context

## Project Baseline

- `expenses` 1.2.0: a small command-line tool that reads an expense CSV and prints per-category totals followed by a grand total.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`type: module`), no runtime or development dependencies.
- Tests use `node:test` and `node:assert/strict`, run with explicit file arguments.

## Structure and Boundaries

- `src/expenses.js` — CSV parsing (`parseExpenses`) and aggregation (`totalsByCategory`).
- `src/report.js` — text layout (`formatReport`).
- `bin/report.js` — command entry point; reads the file named by its first argument.
- `data/sample.csv` — example input.

## Commands

- `npm test` — runs `node --test` on the test files listed in `package.json`.
- `node bin/report.js data/sample.csv` — prints the report for the sample data.

## Conventions and Constraints

- Input has a `date,category,amount` header; dates are ISO `YYYY-MM-DD` strings and stay strings after parsing.
- Parsing errors are thrown as `Error`; the command exits with status 2 on a usage error.
- Two-space indentation, single quotes, named exports, no classes.

## Testing and Verification Baseline

- `test/expenses.test.js` (parsing, totals) and `test/report.test.js` (layout); all 5 tests pass.

## Relevant Existing Behavior

- `report <file>` prints one line per category in name order, amounts with two decimals right-aligned, then a `TOTAL` line. Callers rely on this layout.

## Evidence

- `package.json`, `src/expenses.js`, `src/report.js`, `bin/report.js`, `test/*.test.js`; `npm test` exit 0.

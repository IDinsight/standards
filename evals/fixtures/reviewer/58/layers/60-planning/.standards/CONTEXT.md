# Project Context

## Project Baseline

- `tally` is a small Node.js command-line tool that reads a CSV time log and
  prints total hours per project or per day. Version 0.3.0 in `package.json`.
  No user guide exists; `README.md` has a one-line usage example.

## Stack and Tooling

- Node.js 22 or later (`engines` in `package.json`), plain ES modules, no
  dependencies. Tests use `node:test`.

## Structure and Boundaries

- `bin/tally.js` — executable entry; calls `main` from `src/cli.js` and sets
  the exit code.
- `src/cli.js` — argument parsing (`parseArgs`), defaults, option validation,
  error messages, and exit statuses.
- `src/parse.js` — CSV header and row parsing, date and hours validation
  (`InputError`).
- `src/summary.js` — date filtering, grouping, sorting, and output formatting.
- `test/` — unit and CLI tests; `test/data/sample.csv` is the CLI test input.

## Commands

- `npm test` — runs
  `node --test test/parse.test.js test/summary.test.js test/cli.test.js`.
- `node bin/tally.js <file.csv> [options]` — runs the tool from a checkout.

## Conventions and Constraints

- Usage errors and invalid input print `tally: <message>` and the usage line
  to stderr and exit with status 2. A missing input file prints
  `tally: cannot read <path>` and exits with status 1.

## Relevant Existing Behavior

- The header must name `date`, `project`, and `hours`, matched
  case-insensitively in any order; other columns are ignored. Blank lines are
  skipped. Lines are split on commas with no quote handling.
- Dates must be `YYYY-MM-DD`; hours must be a non-negative number. Row errors
  name the line number in the file.
- `--by` accepts `project` (default) or `day`; `--from` and `--to` take
  `YYYY-MM-DD` and are inclusive; unset means no bound. Options may appear
  before or after the file argument.
- Output rows are sorted by key, hours printed with two decimals, followed by a
  `TOTAL` row.

## Testing and Verification Baseline

- 10 tests across three files; all pass at the current revision.

## Evidence

- `src/cli.js`, `src/parse.js`, `src/summary.js`, `bin/tally.js`, and
  `test/*.test.js` read at ${COMMIT:Add CLI tests and sample data}; `npm test`
  run in the project root, exit 0, 10 passed.

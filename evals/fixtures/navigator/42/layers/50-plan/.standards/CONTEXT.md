# Project Context

## Project Baseline

- `timesheet-report` is a small Node.js command-line tool that summarises hours
  from a timesheet CSV export. It currently prints one weekly total.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no dependencies.

## Structure and Boundaries

- `src/entries.js` — parses and validates `date,project,hours` CSV rows.
- `src/week.js` — Monday-based week arithmetic on ISO dates (UTC).
- `src/report.js` — `weeklyTotal`, rounding to two decimals.
- `src/cli.js` — `run(args, read)` command handler returning `{ code, output }`.

## Commands

- `npm test` — runs `node --test` on the three test files.

## Conventions and Constraints

- Weeks start on Monday; dates are compared as `YYYY-MM-DD` strings.
- Command handlers take an injectable `read` function so tests do not touch the
  file system.

## Testing and Verification Baseline

- `test/entries.test.js`, `test/report.test.js`, `test/cli.test.js` with
  `node:test`.

## Relevant Existing Behavior

- `weeklyTotal` counts entries from the Monday start up to, but not including,
  the following Monday.
- `report` prints `Week of <monday>: <hours> h`.

## Evidence

- `src/report.js`, `src/cli.js`, `README.md`, and `npm test` (exit 0, 6 tests
  passed) at commit `${COMMIT:Add weekly timesheet total report}`.

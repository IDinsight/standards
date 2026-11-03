# Project Context

## Project Baseline

- `ledgerline` 0.4.1 is a small Node.js command-line tool that reads a bank
  statement exported as CSV and prints one month's income, spending, and net
  total. Its only user-facing documentation is a short `README.md`.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules, no runtime dependencies.
- Tests use `node:test`.

## Structure and Boundaries

- `bin/ledgerline.js` — argument handling, output, and exit codes for the
  `import` and `summary` commands.
- `src/parse.js` — CSV parsing; the header must be `date,description,amount`
  (case and surrounding spaces ignored); amounts become integer cents.
- `src/summary.js` — month filter and totals (`monthSummary`) and two-decimal
  formatting (`formatCents`).
- `examples/statement.csv` — example statement used by the README.

## Commands

- `node --test test/import.test.js test/summary.test.js` (also `npm test`) —
  unit tests.
- `node bin/ledgerline.js import <file.csv>` and
  `node bin/ledgerline.js summary <file.csv> --month YYYY-MM`.

## Relevant Existing Behavior

- Exit codes: 0 success; 1 usage error (unknown command, no file argument, or
  `summary` without a `--month` value); 2 invalid month value; 3 unreadable file,
  wrong header, or an entry that cannot be read.
- Fields are split on every comma; quoted fields are not supported. Blank lines
  are skipped.
- Spending is reported as a positive total; net is income minus spending.
- `import` only parses and counts entries; it stores nothing.

## Testing and Verification Baseline

- Unit tests cover parsing and month totals. CLI output and exit codes have no
  automated tests.

## Evidence

- `bin/ledgerline.js`, `src/parse.js`, `src/summary.js`, `test/*.test.js`, and
  `README.md` at `${COMMIT:Add ledgerline import and summary commands}`.

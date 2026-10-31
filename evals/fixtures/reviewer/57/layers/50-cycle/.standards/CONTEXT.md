# Project Context

## Project Baseline

- ledger-tools: a small Node.js repository with one command, `bin/import.js`
  (package bin name `ledger-import`), that reads a bank statement CSV and prints
  a JSON summary. No user guide exists; README.md lists the command in one line.

## Stack and Tooling

- Node.js 22, plain ES modules (`"type": "module"`), no dependencies.

## Structure and Boundaries

- `bin/import.js` — entry point: reads configuration, reads the file, prints the
  summary, and maps any error to a stderr message and exit status 1.
- `src/config.js` — argument and environment parsing (`readConfig`).
- `src/parse.js` — line parsing (`parseLines`) and totals (`summarize`).
- `test/` — `node:test` suites for configuration and parsing.

## Commands

- `node --test test/parse.test.js test/config.test.js` (also `npm test`) — the
  test suite.
- `node bin/import.js <file> [options]` — run the importer from the repository
  root.

## Relevant Existing Behavior

- Options: `--delimiter <char>` (default `,`, exactly one character),
  `--currency <code>` (default from `LEDGER_CURRENCY`, else `USD`), and
  `--no-header` (the header row is skipped by default). Any other `--` option is
  an error; a non-option argument is the input file.
- Lines are split on the delimiter with no quote handling; columns are date,
  description, amount. Blank lines are ignored. Amounts become integer cents via
  `Math.round`.
- Output: one JSON line with `currency`, `count`, and `totalCents` on stdout.
  Errors: `ledger-import: <message>` on stderr, exit status 1.

## Testing and Verification Baseline

- 6 tests across `test/config.test.js` and `test/parse.test.js`; all pass on the
  audited commit.

## Evidence

- `src/config.js`, `src/parse.js`, `bin/import.js`, `test/*.test.js` —
  behavior above.
- `node --test test/parse.test.js test/config.test.js` — exit 0, 6 passed.

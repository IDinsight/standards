# Project Context

## Project Baseline

- `records-export` is a small command-line tool that writes the records of the
  internal records admin tool, bundled in `src/records.js`, as CSV or JSON.
- Output format today: CSV by default; the boolean `--json` flag switches to a
  JSON array. `--status` and `--owner` filter; `--out <file>` writes to a file
  instead of standard output.

## Stack and Tooling

- Node 22, plain JavaScript ES modules (`"type": "module"`), no dependencies,
  no build step.

## Structure and Boundaries

- `bin/export-records.js` — entry point; sets the process exit code from
  `run()`.
- `src/cli.js` — `run(argv, io)`: option parsing with `node:util` `parseArgs`
  in strict mode (unknown options are rejected), validation, choice of
  serialization, and output to standard output or `--out`. Returns 0 or 2.
- `src/csv.js` — `csvCell` and `toCsv` (RFC 4180 quoting, CRLF rows); no I/O.
- `src/records.js` — the four bundled records, `STATUSES`, and
  `filterRecords(list, { status, owner })` ordered by id.

## Commands

- `npm test` — runs `node --test test/csv.test.js test/cli.test.js` from the
  project root; works offline.
- `node bin/export-records.js [options]` — runs the CLI.

## Conventions and Constraints

- Project notes for coding agents in `AGENTS.md`, outside the managed
  STANDARDS block: add no packages, run `npm test` before handing back work,
  keep `src/csv.js` free of I/O, and generate sample data with the CLI.
- Invalid options or values exit with status 2 and an error message on
  standard error, without writing output.

## External Systems and Data

- None. Records are bundled; record 1's title contains a comma and record 3's
  title contains double quotes.

## Testing and Verification Baseline

- `node:test` with `node:assert/strict`. `test/csv.test.js` (3 tests) covers
  serialization; `test/cli.test.js` (5 tests) drives `run()` with captured
  streams and a temporary folder for `--out`.

## Relevant Existing Behavior

- CSV content and the `--status`, `--owner`, and `--out` options are
  documented in `docs/usage.md` and must keep working as they do.

## Evidence

- `package.json`, `bin/`, `src/`, `test/`, `README.md`, `docs/usage.md`, and
  `AGENTS.md` at `${COMMIT:Add notes for coding agents}`.
- `npm test` in the project root at that commit: exit 0, 8 tests passed.

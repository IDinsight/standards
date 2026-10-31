# Project Context

## Project Baseline

- `ledger-import` is a small Node.js command-line tool that converts bank-export
  CSV files into JSON transactions. It has one command, `import`. Audited at
  `${COMMIT:Initial ledger import tool}`.
- Project documentation before this cycle is a short README with no usage
  information; there is no `docs/` folder.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no runtime or
  development dependencies.
- Tests use `node:test` with explicit file arguments.

## Structure and Boundaries

- `bin/ledger.js` — CLI entry point declared as the `ledger` bin in
  `package.json`; dispatches `import` and prints the usage line for anything
  else.
- `src/import.js` — `runImport`: argument parsing, file reading, summary line,
  JSON output, and exit codes.
- `src/parse.js` — `parseCsv` and `toTransaction`: header and row parsing and
  validation.
- `test/parse.test.js`, `test/cli.test.js`, `test/fixtures/sample.csv` —
  existing tests and a three-row sample export.

## Commands

- `node --test test/parse.test.js test/cli.test.js` (the `npm test` script) —
  runs all tests from the project root.
- `node bin/ledger.js import test/fixtures/sample.csv --dry-run` — runs the
  command on the sample file without producing JSON.

## Conventions and Constraints

- Output is written to standard output unless `--out` is given; errors go to
  standard error.
- The CSV reader splits on every comma; there is no quoting support.

## Testing and Verification Baseline

- Seven tests across two files; all pass at the audited revision. They cover
  parsing into cents, the category default, blank lines, a missing column, an
  invalid amount with its line number, `--dry-run`, `--out`, and the usage error
  for a missing file argument.
- Invalid dates, unreadable files, and extra arguments are not covered by tests;
  their behavior is established by reading the source.

## Relevant Existing Behavior

- Header names are trimmed and lowercased; `date`, `description`, and `amount`
  are required, `category` is optional and defaults to `uncategorized`. Extra
  columns are ignored in the output.
- Line numbers in errors count non-blank lines with the header as line 1.
- Dates are checked against the `YYYY-MM-DD` shape only. Amounts go through
  `Number()`, so an empty amount becomes 0; values are rounded to whole cents.
- Success prints `<n> transactions, net <total>` first, then the JSON array to
  standard output or the `--out` file; `--dry-run` prints only the summary.
- Exit codes: 0 success, 1 read or parse failure (`import failed: <message>`),
  2 usage problems (usage line, or `unexpected argument: <arg>`).

## Evidence

- `src/import.js`, `src/parse.js`, `bin/ledger.js` — the behavior above.
- `node --test test/parse.test.js test/cli.test.js` from the project root —
  exit 0, 7 tests passed.

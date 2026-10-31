# Project Context

## Project Baseline

- `csvsum` is a small Node.js command-line tool that reads one CSV file and
  prints the row count, sum, and mean of one numeric column (`package.json`
  `bin`).
- The active cycle documents existing behavior in the user guide
  `docs/usage.md`; it requests no behavior change.

## Stack and Tooling

- Node.js ES modules (`"type": "module"`) with no runtime or development
  dependencies. Option parsing uses `parseArgs` from `node:util`.

## Structure and Boundaries

- `bin/csvsum.js` — CLI entry: option parsing, file reading, output, exit
  statuses.
- `src/parse.js` — `parseCsv(text, delimiter)`: header line and rows.
- `src/summarize.js` — `summarize(rows, column)` and
  `formatSummary(summary, format)`.
- `docs/usage.md` — user guide; `docs/examples/` — sample CSV files the guide's
  examples read.
- `README.md` — short overview pointing to the guide.

## Commands

- `npm test` — runs `node --test test/parse.test.js test/summarize.test.js`.
- `node bin/csvsum.js <file> --column <name>` — runs the CLI from a checkout
  (README.md).

## Conventions and Constraints

- Guide examples are written as `$ csvsum ...` lines in `console` code blocks,
  followed by the exact output, with paths relative to the repository root.

## Testing and Verification Baseline

- Unit tests in `test/` use `node:test` and cover `parseCsv`, `summarize`, and
  `formatSummary`; the CLI entry is not covered.
- The guide's examples are not checked automatically; verify them by running
  each command from the repository root and comparing the output by hand.

## Relevant Existing Behavior

- Options: positional `<file>`, `--column`/`-c` (required), `--delimiter`
  (default `,`), `--format` `text` (default) or `json`. Unknown options and
  missing arguments exit with status 2 and a usage line.
- Text output is three lines: `count N`, `sum X.XX`, `mean X.XX`. JSON output
  is one object with unrounded `count`, `sum`, and `mean`.
- Empty cells are skipped; a non-numeric value or a missing column prints
  `csvsum: <message>` and exits with status 1.
- CSV parsing splits on the delimiter and trims cells; quoted fields are not
  supported.

## Evidence

- `package.json` — `bin` entry and `test` script.
- `bin/csvsum.js`, `src/parse.js`, `src/summarize.js` — options, output, and
  errors.
- `test/parse.test.js`, `test/summarize.test.js` — unit test coverage.
- `docs/usage.md`, `README.md` — existing documentation.

# Project Context

## Project Baseline

- field-export is a small Node.js command-line tool that converts JSON record
  exports from the field survey system into CSV for analysts. The active cycle
  is a standalone documentation cycle about running the export command; no
  implementation change is requested.

## Stack and Tooling

- Node.js 22 or later, plain JavaScript ES modules (`"type": "module"`), no
  runtime or development dependencies, no build step.

## Structure and Boundaries

- `bin/export.js` — executable entry point; passes command-line arguments to
  `run` and sets the exit status.
- `src/cli.js` — argument parsing (`parseArgs`), input reading, field
  selection, output writing, and error messages with exit statuses.
- `src/csv.js` — CSV serialization (`quote`, `toCsv`).
- `data/sample-records.json` — three sample records used by the guide and the
  tests.
- `docs/guide/exporting.md` — analyst guide for running the export command.
- `README.md` — project summary linking to the guide.

## Commands

- `npm test` (runs `node --test test/csv.test.js test/cli.test.js`) — unit
  tests for serialization and the command; all pass on the current tree.
- `node bin/export.js --input <file> [--output <file>] [--fields <names>] [--delimiter <char>]`
  — the export command, run from the repository root.

## Conventions and Constraints

- Usage errors exit with status 2; input and output failures exit with
  status 1. Every error message starts with `error:` and goes to standard
  error.
- Documentation lives in `docs/guide/`; there is no documentation generator,
  link checker, or rendering step.

## Testing and Verification Baseline

- `test/csv.test.js` covers quoting, empty and null values, and the no-field
  case. `test/cli.test.js` covers default and selected fields, `--output` with
  `--delimiter`, missing `--input`, an unknown field, unreadable input, and an
  empty array with `--fields`.
- The command examples in the guide are not run by the test suite.

## Relevant Existing Behavior

- `--input` is required; `--output` defaults to standard output; `--fields`
  defaults to every field in first-seen order; `--delimiter` defaults to `,`
  and must be one character. Option values are taken from the next argument
  only.
- With `--output`, the file is written and `Wrote N records to <path>`
  (singular for one record) is printed to standard output.
- Values containing the delimiter, a double quote, or a line break are quoted,
  with embedded quotes doubled; missing and `null` values are empty; lines end
  with LF.
- An empty input array yields empty output unless `--fields` is given, which
  yields the header row only; field names are not checked for an empty array.
- Errors: `--input is required`, `<option> needs a value`,
  `unknown option <argument>`, `--delimiter must be a single character`, and
  `unknown field <name>` exit 2; `cannot read <path>`,
  `<path> must contain a JSON array of records`, and `cannot write <path>`
  exit 1.
- `docs/guide/exporting.md` was compared with `src/cli.js` and `src/csv.js`,
  and its three command examples were run against `data/sample-records.json`.
  Its options table, defaults, examples and sample output, quoting rules,
  empty-input behavior, and error table match the current behavior. No
  statement in it contradicts the code, and every option and error message the
  command implements is described in it.

## Evidence

- `src/cli.js`, `src/csv.js`, `bin/export.js` — command behavior.
- `docs/guide/exporting.md` — existing analyst guide, compared against the
  above.
- `npm test` — passed on the audited tree.
- `node bin/export.js --input data/sample-records.json`, the same with
  `--output visits.csv`, and with `--fields id,name` — output matched the
  guide.

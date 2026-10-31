# Project Context

## Project Baseline

- `rowtool` is a small Node.js command-line helper for CSV ledger files with
  two commands, `convert` and `validate`. It is used from a checkout; there is
  no release or packaging tooling.
- Project documentation is limited to `README.md`, which describes each command
  in one line. There is no `docs/` folder and no usage guide for either command.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no dependencies.
- Tests use `node:test` with explicit file arguments.

## Structure and Boundaries

- `bin/rowtool.js` — argument parsing, command dispatch, file I/O, and exit
  codes.
- `src/csv.js` — `parseCsv`: first line is the header, remaining lines are rows,
  split on a single delimiter with cells trimmed. No quoted-field support.
- `src/convert.js` — turns rows into objects keyed by header name.
- `src/validate.js` — field-count and required-column checks.
- `examples/ledger.csv` — sample input.

## Commands

- `npm test` — runs `node --test test/convert.test.js test/validate.test.js`.
- `node bin/rowtool.js convert examples/ledger.csv` — run a command from the
  checkout.

## Conventions and Constraints

- Option values are always the next argument (`--delimiter ;`); there are no
  `--name=value` forms or flags without values.

## Relevant Existing Behavior

- `convert` writes pretty-printed JSON (two-space indent, trailing newline) to
  standard output. With `--out <file>` it writes that file instead, overwriting
  it, and prints nothing.
- `--delimiter` defaults to `,`.
- Header names become object keys; all values stay strings; missing trailing
  fields become `""`; fields beyond the header are dropped.
- An unknown option or an option without a value prints the problem and the
  usage text to standard error and exits 2. A missing command or file argument
  prints the usage and exits 2. An unreadable input file is not handled and
  exits with Node's error output.
- `validate` prints `<file>:<line>: <message>` per problem and exits 1, or
  `<file>: ok` and exits 0.

## Testing and Verification Baseline

- `test/convert.test.js` covers key mapping, short rows, and a custom delimiter;
  `test/validate.test.js` covers field counts and required columns. There are
  no CLI-level tests.

## Evidence

- `bin/rowtool.js` — usage text, option parsing, output destination, exit codes.
- `src/csv.js`, `src/convert.js`, `src/validate.js` — parsing and mapping rules.
- `README.md` — current documentation.

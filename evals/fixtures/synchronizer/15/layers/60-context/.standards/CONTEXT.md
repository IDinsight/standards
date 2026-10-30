# Project Context

## Project Baseline

- `records-export` is a small Node command-line tool that converts a JSON file
  holding an array of records into CSV. It has no service, network, or
  database component.
- The command and its tests are established. `docs/cli.md` is the
  user-facing usage guide; `README.md` links it.

## Stack and Tooling

- Node 22, plain JavaScript ES modules (`"type": "module"`), no dependencies
  and no build step. `package.json` maps the `records-export` bin to
  `bin/records-export.js`.

## Structure and Boundaries

- `bin/records-export.js` — executable entry point; passes the arguments and
  the process streams to `run` and sets the exit code.
- `src/cli.js` — `parseArgs`, `USAGE`, `VERSION` (`1.2.0`), and `run`:
  argument parsing, input reading, and output.
- `src/csv.js` — `csvField` and `toCsv`: RFC 4180 quoting relative to the
  delimiter, and CRLF after every row.
- `examples/records.json` — three sample records used by the guide.
- `docs/cli.md` — usage guide for the command.

## Commands

- `npm test` — runs `node --test test/csv.test.js test/cli.test.js` from the
  project root; works offline.
- `node bin/records-export.js <input.json> [options]` — runs the command from a
  checkout.

## Conventions and Constraints

- The input file is the single positional argument. Options: `-c`/`--columns`
  (comma-separated list; default the keys of the first record),
  `-o`/`--output` (file instead of standard output, with a count message on
  standard error), `--delimiter` (one character, default `,`), `-h`/`--help`,
  `-v`/`--version`. There are no other options or short forms.
- Exit status: 0 on success, 1 when the input cannot be read or is not a JSON
  array, 2 for usage errors (message and usage on standard error).

## Testing and Verification Baseline

- `node:test` with `node:assert/strict`. `test/csv.test.js` covers quoting and
  row layout; `test/cli.test.js` calls `run` with captured streams and a
  temporary folder and covers the default columns, `--columns`/`-c`,
  `--output`, `--delimiter`, usage errors, an unreadable input, `--help`, and
  `--version`.

## Relevant Existing Behavior

- The command's interface and output above are established behavior.
- `docs/cli.md` shows examples with `--input`, `--out`, `-d`, and a
  space-separated `--columns` value. `--input`, `--out`, and `-d` are not
  options of the command (rejected as unknown, exit 2), and `--columns` takes
  a comma-separated list, so none of these examples runs as written.

## Evidence

- `package.json`, `bin/`, `src/`, `test/`, `examples/records.json`,
  `docs/cli.md`, and `README.md` at
  `${COMMIT:Add CLI usage guide and sample records}`.
- `npm test` in the project root at that commit: exit 0, 11 tests passed.
- `node bin/records-export.js --input examples/records.json` in the project
  root at that commit: exit 2, `records-export: unknown option: --input`.

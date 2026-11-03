# Project Context

## Project Baseline

- logtrim is a small Node.js command-line tool that filters log files by level
  and message text. This cycle documents existing behavior only.

## Stack and Tooling

- Node.js 22, plain ES modules (`"type": "module"`), no dependencies.

## Structure and Boundaries

- `src/filter.js` — line parsing (`parseLine`) and filtering (`filterLines`).
- `src/cli.js` — argument parsing (`parseArgs`), `run`, and the executable
  entry point (`bin.logtrim` in `package.json`).
- `examples/sample.log` — sample input, also used by the CLI tests.
- `docs/usage.md` — the user guide for the CLI; `README.md` links to it.

## Commands

- `node --test test/filter.test.js test/cli.test.js` (also `npm test`) — runs
  all tests.
- `node src/cli.js [options] [file]` — runs the CLI from a checkout.

## Relevant Existing Behavior

- `--level <name>` sets the lowest level printed; levels in order are debug,
  info, warn, error; the default is `info`. An unknown level is an error.
- `--grep <text>` keeps lines whose message contains the text, ignoring case.
- `--count` prints the number of kept lines instead of the lines.
- With no file argument, input is read from standard input.
- Lines not in `<time> [<level>] <message>` form, or with a level outside the
  four, are dropped.
- Errors (unknown option, missing option value, unknown level) print
  `logtrim: <message>` to standard error and exit with status 2.
- `docs/usage.md` was written with the first version of the CLI and has not
  been edited since; the CLI changed afterwards (see git history of `src/`).

## Testing and Verification Baseline

- `test/filter.test.js` and `test/cli.test.js` use `node:test`; they cover the
  default level, case-insensitive grep, `--count`, standard input, and option
  errors. The project has no documentation lint, link checker, or doc build.

## Evidence

- `src/cli.js`, `src/filter.js`, `test/filter.test.js`, `test/cli.test.js`.
- `git log -- docs/usage.md src/` — guide and source history.

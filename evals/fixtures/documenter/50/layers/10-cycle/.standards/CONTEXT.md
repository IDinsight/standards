# Project Context

## Project Baseline

- `tally` 1.2.0 is a dependency-free Node.js CLI that counts lines, words, and
  characters in files or standard input.

## Stack and Tooling

- Node.js 22 with plain JavaScript ES modules (`"type": "module"`). There are no
  runtime or development dependencies.
- Tests use `node:test` with explicit file arguments.

## Structure and Boundaries

- `src/count.js` — pure `count(text)` returning `{ lines, words, chars }`.
- `src/cli.js` — argument parsing (`parseArgs`), row formatting (`formatRow`),
  and `run(argv, io)` with injectable I/O.
- `bin/tally.js` — executable entry point; calls `run` and sets the exit code.
- `docs/usage.md` — user guide covering options, output format, and exit status.
- `README.md` — short overview that points to the usage guide.

## Commands

- `npm test` / `pnpm test` — runs `node --test test/count.test.js test/cli.test.js`.
- `node bin/tally.js [options] [FILE...]` — runs the CLI from a checkout.

## Conventions and Constraints

- Unknown `--` options are rejected with `tally: unknown option: <arg>` on
  stderr and exit status 2.
- Default output is one row per input: the selected counts right-aligned in
  seven-character columns, then the file name (none for standard input).

## Testing and Verification Baseline

- `test/count.test.js` covers `count`. `test/cli.test.js` covers the
  `parseArgs` defaults, unknown-option rejection, and `run` output for one
  file. All tests pass.

## Evidence

- `src/`, `bin/tally.js`, `test/`, `docs/usage.md`, and `package.json` as of
  the commit "Add tally word count CLI".

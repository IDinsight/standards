# Project Context

## Project Baseline

- `hours`: a small Node command-line tool that totals logged work hours per
  project from a JSON log file. Version 0.3.0; no runtime dependencies.

## Stack and Tooling

- Node 22, plain JavaScript ES modules (`"type": "module"`), no package
  dependencies.

## Structure and Boundaries

- `src/summary.js` — `summarize(entries)`, pure aggregation sorted by project.
- `src/cli.js` — `run(argv, entries, write)`: argument handling and output;
  returns the exit status.
- `bin/hours.js` — entry point; reads `HOURS_FILE` (default `hours.json`) and
  calls `run`.
- `README.md` — user usage and development notes.

## Nearest Analogues

- `summary` in `src/cli.js` is the only command; any new option belongs in its
  argument handling, with aggregation staying in `src/summary.js`.

## Commands

- `npm test` — runs `node --test test/summary.test.js test/cli.test.js`.

## Conventions and Constraints

- Log entries are `{ date: 'YYYY-MM-DD', project, hours }` with zero-padded
  dates.
- `run` writes all output through the `write` callback and returns the exit
  status; usage errors return 1.

## Testing and Verification Baseline

- `node:test` with `node:assert/strict`; tests call `summarize` and `run`
  directly with in-memory entries. Four tests at the time of this audit.

## Relevant Existing Behavior

- `hours summary` prints `project` TAB `hours` lines sorted by project name and
  exits 0; any other command or extra argument prints usage and exits 1.

## Evidence

- `src/summary.js`, `src/cli.js`, `bin/hours.js`, `test/summary.test.js`,
  `test/cli.test.js`, `README.md`, `package.json`.
- `npm test` in the project root: exit 0, 4 passing.

# Project Context

## Project Baseline

- `cronlet` is a small local interval scheduler: it reads jobs from a JSON
  config and reports which jobs are due at an elapsed time.
- Job intervals are positive integers in seconds.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no
  dependencies.

## Structure and Boundaries

- `src/config.js` — parses and validates the JSON config (`parseConfig`,
  `loadConfig`); the only place job intervals are interpreted.
- `src/scheduler.js` — `dueJobs(jobs, elapsedSeconds)`; consumes
  `intervalSeconds` only.

## Nearest Analogues

- `src/config.js` command validation — the established pattern for rejecting a
  job field with a `config: <job name>: <problem>` message.

## Commands

- `npm test` — runs `node --test test/config.test.js test/scheduler.test.js`,
  the full suite.

## Conventions and Constraints

- Validation errors are thrown as `Error` with messages of the form
  `config: <job name>: <problem>`.
- Parsed jobs have the shape `{ name, command, intervalSeconds }`.

## Testing and Verification Baseline

- `node:test` with explicit file arguments. `test/config.test.js` covers
  integer intervals and a missing command; `test/scheduler.test.js` covers
  `dueJobs`.

## Relevant Existing Behavior

- Integer intervals load unchanged as seconds; any other interval value is
  rejected.
- `README.md` does not describe interval syntax; `jobs.example.json` uses
  integer intervals.

## Evidence

- `src/config.js`, `src/scheduler.js`, `test/`, `package.json`, `README.md`,
  `jobs.example.json`.

# Project Context

## Project Baseline

- `tasks` is a small command-line task list for one user. Tasks live in a JSON
  file (default `tasks.json` in the working directory, overridable with
  `TASKS_FILE`).

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no runtime or
  dev dependencies.
- Tests use the built-in `node:test` runner and `node:assert/strict`.

## Structure and Boundaries

- `bin/tasks.js` — executable entry; passes `process.argv` and `TASKS_FILE` to
  `run`.
- `src/cli.js` — `run(argv, { file, out })` dispatches `add`, `done`, and
  `list`; `formatTask` renders one list line. Arguments are read by position.
- `src/store.js` — pure task functions (`addTask`, `completeTask`,
  `listTasks`) and JSON persistence (`loadTasks`, `saveTasks`). Functions
  return new arrays rather than mutating their input.

## Commands

- `npm test` — runs `node --test test/store.test.js test/cli.test.js`.
- `node bin/tasks.js list` — manual run against `./tasks.json`.

## Conventions and Constraints

- Store functions do not print or parse arguments; the CLI does not touch the
  file format directly.
- `run` returns an exit code and writes through the injected `out` function,
  which tests capture.

## Testing and Verification Baseline

- `test/store.test.js` covers id assignment, title validation, completion, and
  the open/all listing rule.
- `test/cli.test.js` drives `run` against a temporary file and checks printed
  lines.
- All tests pass at the audited commit.

## Relevant Existing Behavior

- Task record is `{ id, title, done }`; ids are the highest existing id + 1.
- `list` shows open tasks; `list --all` includes completed ones. Line format is
  `<id>. [ ] <title>` or `<id>. [x] <title>`.
- A missing task file loads as an empty list.

## Evidence

- `src/store.js`, `src/cli.js`, `bin/tasks.js`, `package.json`, `test/` — read
  directly.
- `npm test` — 7 tests pass.

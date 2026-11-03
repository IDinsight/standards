# Project Context

## Project Baseline

- `tasklog` is a small command-line task list (version 0.3.0). Tasks are kept
  in a JSON file and managed with `add`, `done`, and `list` commands.
- Tasks currently have `id`, `title`, `done`, and `createdAt`; there is no due
  date or any other date-based behavior.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no runtime or
  development dependencies.
- Tests use the built-in `node:test` runner and `node:assert/strict`.

## Structure and Boundaries

- `src/store.js` — reads and writes the task file. The file shape is
  `{ "version": 1, "tasks": [...] }`; a missing file loads as an empty list.
- `src/tasks.js` — pure task functions (`addTask`, `completeTask`,
  `openTasks`, `formatTask`) that take and return task arrays without I/O.
- `src/cli.js` — argument handling; `run(args, file)` returns the text to
  print and throws on errors, which the entrypoint prints with exit code 1.
- `test/tasks.test.js` — unit tests for `src/tasks.js` and an end-to-end test
  of `run` against a temporary file.

## Commands

- `npm test` (runs `node --test test/tasks.test.js`) — the full test suite.
- `node src/cli.js <command> ...` — run the CLI; `TASKLOG_FILE` selects the
  task file, defaulting to `tasks.json` in the working directory.

## Conventions and Constraints

- Domain logic stays in `src/tasks.js` without file or console access; only
  `src/store.js` touches the file system.
- Validation errors are thrown as `Error` with a short lowercase message and
  surface to the user unchanged.
- `addTask` takes an injectable `now` for deterministic tests.
- Task files written by earlier versions must keep loading; the file carries
  `version: 1` but no migration mechanism exists.

## External Systems and Data

- None. The only persistent data is the local JSON task file.

## Testing and Verification Baseline

- All five tests in `test/tasks.test.js` pass on the current tree.
- The CLI is tested through `run` rather than by spawning a process.

## Relevant Existing Behavior

- `list` shows open tasks; `list --all` shows every task. Output lines use
  `[ ] <id>. <title>` or `[x] <id>. <title>`.
- Ids are one more than the highest existing id.

## Evidence

- `src/store.js`, `src/tasks.js`, `src/cli.js` — structure, file format, and
  command behavior.
- `npm test` — passed on the audited commit.

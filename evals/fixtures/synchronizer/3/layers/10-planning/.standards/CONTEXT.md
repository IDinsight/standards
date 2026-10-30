# Project Context

## Project Baseline

- `tasklist` is a small ES-module library of task list helpers used by the
  team's daily review script. It exports one function, `listTasks`.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no external
  dependencies.

## Structure and Boundaries

- `src/tasks.js` — `listTasks(tasks, options)`: optional `status` filter, then
  sort by `due` ascending with undated tasks last and ties broken by `id`.
- `test/tasks.test.js` — `node:test` suite for `listTasks`.
- `README.md` — usage documentation for library callers.

## Commands

- `npm test` (runs `node --test test/tasks.test.js`) — the full test suite.

## Conventions and Constraints

- Tasks are plain objects: `id`, `title`, `status` (`open` or `done`), optional
  `due` as a `YYYY-MM-DD` string. `listTasks` never mutates its input array.

## Testing and Verification Baseline

- Two existing tests cover the status filter and the ordering rule; both pass.

## Evidence

- `src/tasks.js`, `test/tasks.test.js`, `package.json`, `README.md`.
- `npm test` — exit 0, 2 tests passed.

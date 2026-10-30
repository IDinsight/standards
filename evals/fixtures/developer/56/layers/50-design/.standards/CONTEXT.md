# Project Context

## Project Baseline

- `tasks` is a small in-memory task list library. Callers create, update, and
  list tasks through the functions in `src/tasks.js`.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`type: module` in `package.json`),
  no npm dependencies.
- Tests use `node:test` and `node:assert/strict`.

## Structure and Boundaries

- `src/tasks.js` — public `createTask`, `updateTask`, `listTasks`; all input
  validation.
- `src/store.js` — `TaskStore`, an in-memory map that returns copies so callers
  cannot mutate stored tasks.
- `src/errors.js` — `TaskValidationError`, thrown for invalid input.
- `test/` — `node:test` suites, listed explicitly in the `test` script.

## Commands

- `npm test` — runs `node --test` with the test files listed in `package.json`.
- `node --test test/tasks.test.js` — the same suite run directly.

## Conventions and Constraints

- Validation happens in `src/tasks.js` before anything reaches the store; a
  rejected call leaves the store unchanged.
- Store methods return copies of stored tasks.
- `updateTask` returns `null` for an unknown id rather than throwing.

## Testing and Verification Baseline

- `test/tasks.test.js` covers creation, title validation, status updates,
  unknown ids, and the status filter (5 tests, all passing).

## Relevant Existing Behavior

- `listTasks(store, { status })` returns every task when `status` is omitted.

## Evidence

- `src/tasks.js`, `src/store.js`, `src/errors.js` — module boundaries and
  validation order.
- `node --test test/tasks.test.js` — 5 passed.

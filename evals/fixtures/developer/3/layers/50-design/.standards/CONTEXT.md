# Project Context

## Project Baseline

- `taskboard` is a small dependency-free JavaScript library for task records:
  creating and completing tasks (`src/tasks.js`) and reporting over task lists
  (`src/report.js`). Callers own storage; there is no persistence layer.

## Stack and Tooling

- Node.js 22, ES modules (`"type": "module"`), no npm dependencies.
- Tests use the built-in `node:test` runner with `node:assert/strict`.

## Structure and Boundaries

- `src/tasks.js` — task creation and validation (`createTask`, `completeTask`,
  `ValidationError`, `PRIORITIES`). Tasks are plain objects
  `{ id, title, priority, done }`.
- `src/report.js` — read-only views over task arrays (`summarize`,
  `listOpen`); never mutates its input.
- `test/` — one test file per module.

## Commands

- `npm test` — runs `node --test test/tasks.test.js test/report.test.js` from
  the project root.

## Conventions and Constraints

- Invalid input to `createTask` throws `ValidationError` with a short message
  naming the field.
- Functions return new objects or arrays rather than mutating arguments.

## Testing and Verification Baseline

- `test/tasks.test.js` covers title trimming, the priority default and
  validation, id validation, and `completeTask`.
- `test/report.test.js` covers `summarize` counts, `listOpen` ordering (high,
  normal, low, then id), and that `listOpen` leaves its input in place.

## Evidence

- `package.json`, `src/tasks.js`, `src/report.js`, `test/tasks.test.js`,
  `test/report.test.js`; `npm test` passes (8 tests).

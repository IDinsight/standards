# Project Context

## Project Baseline

- `taskboard` is the core of a small task-tracking service: an in-memory
  `TaskStore` and request handlers that return `{ status, body }` objects. A
  host application outside this repository mounts the handlers and passes
  query-string values through as strings.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no runtime or
  development dependencies.

## Structure and Boundaries

- `src/store.js` — `TaskStore` and the `STATUSES` list (`open`,
  `in_progress`, `done`); `add` rejects any other status.
- `src/tasks.js` — handlers `listTasks` and `getTask`.
- `test/` — `node:test` suites.

## Commands

- `npm test` — runs `node --test` over the test files listed in
  `package.json`.

## Conventions and Constraints

- Handlers return a status and body for client input instead of throwing.
- Due dates are stored as `YYYY-MM-DD` strings or `null`.

## Testing and Verification Baseline

- `test/store.test.js` covers task creation, status validation, the `getTask`
  404 result, and the unfiltered `listTasks` result.

## Relevant Existing Behavior

- `listTasks(store)` returns every task in insertion order.

## Evidence

- `src/store.js`, `src/tasks.js`, `test/store.test.js`, `package.json`.

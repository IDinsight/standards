# Project Context

## Project Baseline

- `records-service` is a small in-memory record store used by the operations
  dashboard.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no runtime
  dependencies.

## Structure and Boundaries

- `src/store.js` — `createStore()` with `add`, `get`, and `list`.
- `test/` — `node:test` suites.

## Commands

- `npm test` — runs the listed test files with `node --test`.

## Testing and Verification Baseline

- `test/store.test.js` covers id assignment, listing, and lookup.

## Evidence

- `package.json`, `src/store.js`, `test/store.test.js`.

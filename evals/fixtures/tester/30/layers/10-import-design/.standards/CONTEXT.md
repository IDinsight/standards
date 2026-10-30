# Project Context

## Project Baseline

- `contacts` is a small in-memory contacts directory library for Node.js with
  `Directory` (`add`, `get`, `remove`, `list`, `size`) and
  `loadDirectory(path)`.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no runtime or
  development dependencies.

## Structure and Boundaries

- `src/directory.js` — `Directory` class and `loadDirectory(path)`.
- `test/directory.test.js` — `node:test` suite for `Directory`.

## Commands

- `npm test` — runs `node --test test/directory.test.js` from the project root.

## Relevant Existing Behavior

- `loadDirectory` parses the file with `JSON.parse` and adds every row without
  validation; `add` throws `contact id is required` when `id` is missing.
- `list()` returns copies of stored contacts sorted by `name` with
  `localeCompare`.

## Testing and Verification Baseline

- `test/directory.test.js` covers add/get, list ordering, remove, and the
  required id. No test covers `loadDirectory`.

## Evidence

- `src/directory.js`, `test/directory.test.js`, `package.json`.

# Project Context

## Project Baseline

- `contacts` is a small in-memory contacts directory library for Node.js:
  `Directory` (`add`, `get`, `remove`, `list`, `size`), `loadDirectory(path)`
  with input validation, and `saveDirectory(directory, path)`. Import
  validation and saving came from the signed-off contact import cycle and are
  established baseline.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no runtime or
  development dependencies.

## Structure and Boundaries

- `src/directory.js` — `Directory`, `loadDirectory`, and `saveDirectory`.
- `test/` — `node:test` suites, passed explicitly to `node --test`.

## Commands

- `npm test` — runs `node --test test/directory.test.js test/import.test.js`
  from the project root.

## Conventions and Constraints

- Contacts are plain objects `{ id, name, email }`; `id` is required and `add`
  throws without it.
- `list()` returns copies of stored contacts sorted by `name` with
  `localeCompare`; `saveDirectory` writes in the same order.
- Emails are trimmed and lowercased by `loadDirectory`, not by `add`.

## Testing and Verification Baseline

- `test/directory.test.js` (4 tests): add/get, list ordering, remove, required
  id.
- `test/import.test.js` (5 tests): load validation, email normalization, save
  round-trip; uses temporary files under the OS temp folder.
- No search behavior or search tests exist in the baseline.

## Evidence

- `src/directory.js`, `test/directory.test.js`, `test/import.test.js`,
  `package.json`, `README.md`.

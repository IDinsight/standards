# Project Context

## Project Baseline

- `staff-directory` is a small Node.js library that loads staff records from a JSON file and looks people up by id. It has no search.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no runtime or development dependencies.

## Structure and Boundaries

- `src/directory.js` — `loadUsers(path)` reads a JSON array and returns `{ id, name, email }` records, dropping other fields; `findUserById(users, id)` returns a record or `null`.
- `data/users.json` — sample staff records (six people, with a `team` field that `loadUsers` drops).
- `test/` — `node:test` suites.

## Commands

- `npm test` — runs `node --test` with each test file listed explicitly in `package.json`; a new test file must be added to the script.

## Conventions and Constraints

- Library functions are pure over arrays of user records; only `loadUsers` does I/O.

## Testing and Verification Baseline

- `test/directory.test.js` — three tests covering loading and id lookup; all pass at audit time (`npm test`, exit 0).

## Evidence

- `package.json`, `src/directory.js`, `data/users.json`, `test/directory.test.js`.

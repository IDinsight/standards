# Project Context

## Project Baseline

- `contacts-service` is a small in-memory contacts API. Contacts live in a
  `Map` per process; there is no database or persistence.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no runtime or
  development dependencies.
- Tests use the built-in `node:test` runner with `node:assert/strict`.

## Structure and Boundaries

- `src/contacts.js` — `createStore(seed)`: in-memory store; `add` trims names
  and lowercases emails; `get(id)` and `list()` (insertion order).
- `src/routes.js` — `route(store, method, url)`: pure request routing that
  returns `{ status, body }`; only `GET` is supported.
- `src/server.js` — thin `node:http` wrapper around `route`; not exercised by
  tests.
- `test/` — `node:test` suites.

## Commands

- `npm test` — runs `node --test` with each test file listed explicitly in
  `package.json`; a new test file must be added to that script.
- `npm start` — starts the HTTP server on `PORT` (default 3000).

## Conventions and Constraints

- Handlers return `{ status, body }`; error bodies are `{ error: <message> }`.
- Emails are stored lowercased; names are stored trimmed.

## Testing and Verification Baseline

- `test/contacts.test.js` covers normalization on add, listing, and lookup by
  id including the 404 path. All three tests pass.

## Evidence

- `package.json`, `src/*.js`, and `test/contacts.test.js` at
  `${COMMIT:Add contact lookup by id}`.
- `node --test test/contacts.test.js` in the project root — exit 0, 3 passed.

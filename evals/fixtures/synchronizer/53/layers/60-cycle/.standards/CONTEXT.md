# Project Context

## Project Baseline

- `records-api`: a small Node.js records service. Handlers are plain functions
  that take a request object and return `{ status, headers, body }`; there is
  no HTTP framework in this repository.

## Stack and Tooling

- Node.js 22, ES modules (`"type": "module"`), no npm dependencies.

## Structure and Boundaries

- `src/records.js` — in-memory record store (`createStore`).
- `src/handlers.js` — JSON listing handler.
- `src/csv.js` — RFC 4180 CSV serializer (`toCsv`).
- `test/` — `node:test` suites, one file per module.

## Nearest Analogues

- `src/handlers.js` `listHandler` — the handler shape and response conventions
  a new export handler should follow.

## Commands

- `npm test` — runs the `node --test` files listed in `package.json`; new test
  files must be added to that script.

## Conventions and Constraints

- The session layer (outside this repository) sets `req.user` to the
  authenticated account `{ id, roles }`, or `null`. Service tokens arrive as
  accounts without a `roles` array.

## Testing and Verification Baseline

- `test/records.test.js` and `test/csv.test.js` pass. There are no
  authorization tests yet.

## Evidence

- `package.json`, `src/*.js`, `test/*.test.js` at the installation commit.

# Project Context

## Project Baseline

- `office-lookup` resolves three-letter office codes to office records for the
  internal API gateway. It is a single-process Node.js module with no external
  services.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no npm
  dependencies.
- Tests use the built-in `node:test` runner with explicit file arguments.

## Structure and Boundaries

- `src/directory.js` — office records (`OFFICES`) and
  `createDirectory().find(code)`, which trims and upper-cases the code and
  returns the record or `null`.
- `src/handler.js` — `handleLookup(req, { directory })`; returns
  `{ status, headers, body }` with 200, 400 (missing `query.code`), or 404.
- `src/app.js` — `createApp()` wires a directory into `lookup(req)`; this is
  what the gateway calls.

## Nearest Analogues

- `src/handler.js` — dependencies are passed in as a second argument object,
  which keeps tests free of module mocks; new request-level behavior follows the
  same pattern.

## Commands

- `node --test test/directory.test.js test/handler.test.js` (the `test` script
  in `package.json`) — runs all tests from the project root.

## Conventions and Constraints

- Requests reach the handler as `{ clientId, query }`; the gateway sets
  `clientId` to the caller's API key name. The handler currently ignores
  `clientId`.
- No process-external state: anything kept between requests lives in memory.

## Testing and Verification Baseline

- `test/directory.test.js` (2 tests) and `test/handler.test.js` (3 tests) pass
  on the current tree.

## Relevant Existing Behavior

- Error bodies are `{ error: '<message>' }` with an empty `headers` object.

## Evidence

- `src/handler.js`, `src/app.js`, `src/directory.js`, `package.json`, and a
  local run of the test script (5 passing).

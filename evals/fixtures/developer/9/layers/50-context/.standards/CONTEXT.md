# Project Context

## Project Baseline

- `bookmarks-service` is a small Node.js JSON API for saving bookmarks. It
  supports listing (`GET /bookmarks`) and adding (`POST /bookmarks`)
  bookmarks.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no runtime or
  development dependencies.
- Tests use `node:test` and `node:assert/strict`.

## Structure and Boundaries

- `src/server.js` — `node:http` server: parses the URL and request body,
  dispatches to route handlers, writes JSON responses. Uncaught errors become
  500 `{ "error": "internal_error" }` and are logged with `console.error`.
- `src/routes/bookmarks.js` — `createBookmarkRoutes({ store })` returns handler
  functions that return `{ status, body }`; no HTTP objects are involved.
- `src/store.js` — `createStore(file)`: JSON file store (`{ nextId, items }`)
  re-read on every call; read or parse errors propagate as thrown errors.
- `src/validate.js` — input validation for new bookmarks.
- `data/bookmarks.json` — default data file.

## Commands

- `npm test` (runs `node --test test/bookmarks.test.js`) — run the tests from
  the project root.
- `npm start` — serve on `PORT` (default 3000), data from `BOOKMARKS_FILE`.

## Conventions and Constraints

- Error responses use `{ "error": "<code>" }` with snake_case codes
  (`invalid_bookmark`, `not_found`, `internal_error`); validation errors add a
  `problems` list. Internal error details stay in the server log.
- Handlers are tested directly, without HTTP.
- The `package.json` `test` script lists test files explicitly; new test files
  must be added to it.

## Testing and Verification Baseline

- `test/bookmarks.test.js` covers create plus list and title validation, using
  a temporary data file.

## Evidence

- `src/`, `test/bookmarks.test.js`, and `package.json` at
  ${COMMIT:Initial bookmarks service}.

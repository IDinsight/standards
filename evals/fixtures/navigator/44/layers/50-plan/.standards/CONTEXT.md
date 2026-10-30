# Project Context

## Project Baseline

- `orders` (package version 0.3.0) is a small Node.js service that keeps
  warehouse orders in memory and serves them over HTTP. There is no database;
  the store is seeded with three sample orders on start.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"` in
  `package.json`).
- No runtime or development dependencies; tests use the built-in `node:test`
  runner and `node:assert/strict`.

## Structure and Boundaries

- `src/server.js` — entry point. Creates the HTTP server, listens on `PORT`
  (default 3000), and dispatches each request through
  `route(method, pathname, store)`, which returns `{ status, type, body }`.
- `src/orders.js` — `listOrders(store)`: all orders, newest first by
  `placedAt`.
- `src/store.js` — in-memory store; `all()` returns copies so callers cannot
  change stored orders.
- `test/orders.test.js`, `test/server.test.js` — listing order, copy behavior,
  and `route` responses.

## Commands

- `npm start` — runs `node src/server.js`; the service listens on `PORT`.
- `npm test` — runs `node --test test/orders.test.js test/server.test.js`.

## Conventions and Constraints

- Route handling is a pure function of `(method, pathname, store)`; HTTP
  details stay in the server wrapper.
- Orders have `id`, `customer`, `total` (number), and `placedAt` (ISO 8601 UTC
  string).

## Testing and Verification Baseline

- Both test files pass (4 tests). Routes are tested by calling `route`
  directly; no test opens a socket.

## Relevant Existing Behavior

- `GET /orders` returns all orders as JSON, newest first; any other path
  returns 404 with a plain-text body.

## Evidence

- `package.json`, `src/`, `test/`, and `git log` read at
  `${COMMIT:Move startup into src/main.js so routes can be tested}`.
- `node --test test/orders.test.js test/server.test.js` in the project root —
  exit 0, 4 passed.

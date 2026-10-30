# Project Context

## Project Baseline

- `order-desk` is a small Node.js module: an in-memory order store and route
  handlers that return `{ status, headers, body }` objects for a host HTTP
  server that is not part of this repository.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no runtime or
  development dependencies.

## Structure and Boundaries

- `src/orders.js` — `createStore(orders)` with `list({ status })`, sorted by
  ascending id, and `add(order)`; `STATUSES` is the valid status set.
- `src/money.js` — `formatCents(cents)` renders integer cents as a
  two-decimal string.
- `src/http.js` — route handlers; `handleOrders(store, query)` returns orders as
  JSON and rejects an unknown `status` with 400.
- `test/` — `node:test` suites.

## Commands

- `npm test` — runs `node --test test/*.test.js` from the project root.

## Conventions and Constraints

- Totals are stored as integer cents and formatted only at the response
  boundary.
- Handlers do not throw for bad input; they return 400 with a JSON `{ error }`
  body.

## Testing and Verification Baseline

- `test/orders.test.js` covers store ordering, status filtering, and status
  validation; `test/http.test.js` covers `handleOrders` total formatting and the
  400 on an unknown status. Both suites pass.

## Evidence

- `package.json`, `src/*.js`, `test/*.test.js` at the pre-cycle commit.

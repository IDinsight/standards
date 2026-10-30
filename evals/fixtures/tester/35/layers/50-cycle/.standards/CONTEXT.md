# Project Context

## Project Baseline

- `order-summary` is a small Node.js command that reads the shop's order
  export (CSV) and prints a total per customer.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules; no dependencies, no build step.

## Structure and Boundaries

- `src/parse.js` — `parseOrders(text)`: header-driven parsing; trims cells;
  rejects a missing or non-numeric amount with an error starting `line N:`.
- `src/summary.js` — `summarize(orders)`: total per customer in
  first-appearance order, rounded to cents.
- `src/cli.js` — entry point; prints `customer<TAB>total` with two decimals.

## Commands

- `npm test` — runs `node --test test/*.test.js` from the project root.

## Testing and Verification Baseline

- `test/parse.test.js` and `test/summary.test.js` (`node:test`) read
  `test/fixtures/orders.csv`. Nothing tests `src/cli.js`.
- `npm test` at the pre-cycle head: 4 tests, 4 passed.

## Evidence

- Source files, `package.json`, and `README.md` read directly; `npm test` run.

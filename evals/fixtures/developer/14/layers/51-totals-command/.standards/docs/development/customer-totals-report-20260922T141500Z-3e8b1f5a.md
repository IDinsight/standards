<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: customer-totals-report-20260922T141500Z-3e8b1f5a
-->

# Development Plan

`Cycle`: `customer-totals-report-20260922T141500Z-3e8b1f5a` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true`
`Status`: `COMPLETE` `Verification Cadence`:
`AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `NONE`
- `Architecture`: `NONE`
- `Request`: `Add a report of order totals per customer to the orders CLI.`

## Build Steps

### DEV-001 — Per-customer totals from parsed orders

`Status`: `DONE` `Depends On`: `NONE`
`Acceptance`: `EXPEDITED_REQUEST`

**Goal**

Compute each customer's order total from the orders returned by `loadOrders`.

**Affected Area**

New module `src/totals.js`; consumes the `{ id, customer, amountCents, date }`
objects produced by `src/orders.js`.

**Expected Outcome**

`totalsByCustomer(orders)` returns one `{ customer, totalCents }` entry per
distinct customer, with `totalCents` the integer sum of that customer's
`amountCents`, ordered by total descending and then by customer name.

**Self-Check**

- `npm test` in the project root, on the working tree at
  ${COMMIT:Plan customer totals report} plus the new `src/totals.js`: exit 0,
  6 tests, 6 passed. These are the existing tests; none of them exercise
  `totalsByCustomer`.
- `node --input-type=module -e "import { loadOrders } from './src/orders.js'; import { totalsByCustomer } from './src/totals.js'; console.log(JSON.stringify(totalsByCustomer(loadOrders('test/data/orders.csv'))));"`
  in the project root, same content: printed
  `[{"customer":"Cobalt Inc","totalCents":21000},{"customer":"Acme Ltd","totalCents":15075},{"customer":"Birch & Co","totalCents":15075}]`,
  matching totals computed by hand from the sample file.

### DEV-002 — `totals` command in the CLI

`Status`: `DONE` `Depends On`: `DEV-001`
`Acceptance`: `EXPEDITED_REQUEST`

**Goal**

Expose the per-customer totals as `orders totals <file>`.

**Affected Area**

`bin/orders.js` (command dispatch and usage message); reuses `formatCents` from
`src/format.js`.

**Expected Outcome**

`node bin/orders.js totals <file>` prints one `<customer>: <amount>` line per
customer in the order returned by `totalsByCustomer`, amounts with two
decimals. `summary` output is unchanged; the usage message lists both commands
and still exits with status 2.

**Self-Check**

- `node bin/orders.js totals test/data/orders.csv` in the project root, on the
  working tree at ${COMMIT:Plan customer totals report} plus `src/totals.js`
  and the `bin/orders.js` change: exit 0, printed `Cobalt Inc: 210.00`,
  `Acme Ltd: 150.75`, `Birch & Co: 150.75`, in that order.
- `node bin/orders.js summary test/data/orders.csv`, same content: unchanged
  output, `Orders: 5` and `Total: 511.50`.
- `npm test` in the project root, same content: exit 0, 6 tests, 6 passed.

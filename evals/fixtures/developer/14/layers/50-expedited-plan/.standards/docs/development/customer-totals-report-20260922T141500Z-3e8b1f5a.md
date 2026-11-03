<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: customer-totals-report-20260922T141500Z-3e8b1f5a
-->

# Development Plan

`Cycle`: `customer-totals-report-20260922T141500Z-3e8b1f5a` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true`
`Status`: `APPROVED` `Verification Cadence`:
`AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `NONE`
- `Architecture`: `NONE`
- `Request`: `Add a report of order totals per customer to the orders CLI.`

## Build Steps

### DEV-001 — Per-customer totals from parsed orders

`Status`: `PENDING` `Depends On`: `NONE`
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

Run `npm test` in the project root, and print `totalsByCustomer` for
`test/data/orders.csv` to compare with totals computed by hand.

### DEV-002 — `totals` command in the CLI

`Status`: `PENDING` `Depends On`: `DEV-001`
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

Run `node bin/orders.js totals test/data/orders.csv` and
`node bin/orders.js summary test/data/orders.csv` in the project root, then
`npm test`.

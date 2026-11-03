<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: summarize-orders-per-currency-apply-20260924T081500Z-5c8e2a91
-->

# Development Plan

`Cycle`: `summarize-orders-per-currency-apply-20260924T081500Z-5c8e2a91` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true` `Status`: `COMPLETE`
`Verification Cadence`: `INCREMENTAL` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/summarize-orders-per-currency-apply-20260924T081500Z-5c8e2a91.md`
- `Architecture`: `.standards/docs/specs/summarize-orders-per-currency-apply-20260924T081500Z-5c8e2a91.md`
- `Request`: `Summarize orders per currency, apply refunds, and add JSON output.`

## Build Steps

### DEV-001 — Read each order's currency

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `AC-001`

**Goal**

Give every parsed order the currency it was charged in.

**Affected Area**

`src/parse.js`.

**Expected Outcome**

Each parsed order has a `currency` field: the trimmed, uppercased cell, or
`USD` when the column is absent or the cell is empty.

**Self-Check**

`npm test` in the project root on
`${COMMIT:Read currency column from order export}`: exit 0, 4 tests passed.

### DEV-002 — Total per customer and currency

`Status`: `DONE` `Depends On`: `DEV-001` `Acceptance`: `AC-002`

**Goal**

Keep a separate total for each customer and currency.

**Affected Area**

`src/summary.js`.

**Expected Outcome**

`summarize` returns one `{ customer, currency, total }` row per customer and
currency, rounded to cents.

**Self-Check**

`npm test` in the project root on
`${COMMIT:Add per-currency totals and refund handling}`: exit 0, 7 tests passed.

### DEV-003 — Order type and refunds

`Status`: `DONE` `Depends On`: `DEV-001, DEV-002` `Acceptance`: `AC-003`

**Goal**

Count refunds against the customer's total.

**Affected Area**

`src/parse.js` (order type) and `src/summary.js` (signed amounts).

**Expected Outcome**

Each order has a `type` of `sale` or `refund` (`sale` when absent or empty);
other types throw an error naming the line; refunds are subtracted.

**Self-Check**

Same run as DEV-002, plus a `node -e` spot check: a 50 sale and a 20 refund for
one customer and currency summarized to 30.

### DEV-004 — Ordered rows and text and JSON output

`Status`: `DONE` `Depends On`: `DEV-002, DEV-003` `Acceptance`: `AC-004`

**Goal**

Print the summary for people and for the billing ledger import.

**Affected Area**

`src/summary.js` (row order), new `src/format.js`, `src/cli.js`.

**Expected Outcome**

Rows ordered by customer, then currency; default output is tab-separated
customer, currency, and total; `--format json` prints the rows as JSON as the
design defines; invalid usage prints the usage line and exits 2.

**Self-Check**

On `${COMMIT:Add JSON summary output}` in the project root: `npm test` exit 0,
12 tests passed; `node src/cli.js --format json test/fixtures/orders.csv`
printed four rows ordered acme/EUR, acme/USD, globex/EUR, initech/USD;
`node src/cli.js --format xml test/fixtures/orders.csv` printed the usage line
and exited 2.

**Implementation Notes**

Ordering lives in `summarize` so both formats share it.

## Verification Increments

### Increment 1

`Development Steps`: `DEV-001` `Acceptance`: `AC-001`

**Ready Outcome**

`parseOrders` returns each order's currency, defaulting to `USD`.

### Increment 2

`Development Steps`: `DEV-002, DEV-003` `Acceptance`: `AC-002, AC-003`

**Ready Outcome**

`summarize` returns one total per customer and currency, with refunds
subtracted.

## Plan Notes

- The user asked for incremental verification before the plan was written; it
  was applied when the plan was approved.
- Increments 1 and 2 were verified by Tester and returned by checkpoint. DEV-004
  was implemented after the Increment 2 return without a further increment;
  with every step done, the plan was handed to Tester.

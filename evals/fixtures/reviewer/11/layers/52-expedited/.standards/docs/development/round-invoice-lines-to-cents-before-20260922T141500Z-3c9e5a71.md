<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: round-invoice-lines-to-cents-before-20260922T141500Z-3c9e5a71
-->

# Development Plan

`Cycle`: `round-invoice-lines-to-cents-before-20260922T141500Z-3c9e5a71` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true`
`Status`: `COMPLETE` `Verification Cadence`: `AFTER_IMPLEMENTATION`
`Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `NONE`
- `Architecture`: `NONE`
- `Request`: `Round invoice lines to cents before summing.`

## Build Steps

### DEV-001 — Round line totals and the invoice total to cents

`Status`: `DONE` `Depends On`: `NONE`
`Acceptance`: `EXPEDITED_REQUEST`

**Goal**

Each line total is rounded before it is added, so the invoice total equals the
sum of the amounts printed on the lines.

**Affected Area**

`src/totals.js` (`lineTotal`, `invoiceTotal`); `src/invoice.js` calls
`invoiceTotal` unchanged.

**Expected Outcome**

`lineTotal` returns the product rounded to two decimals; `invoiceTotal` sums the
rounded lines and rounds the sum to two decimals.

**Self-Check**

`node --test test/totals.test.js` in the project root on the working tree later
committed as "Round invoice lines to cents before summing": exit 0, 3 passed.
`node --input-type=module -e "import { lineTotal } from './src/totals.js'; console.log(lineTotal({ quantity: 3, unitPrice: 0.333 }))"`
printed `1`.

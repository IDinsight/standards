<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: round-each-invoice-line-total-to-cents-20260924T083000Z-5c9e2a71
-->

# Development Plan

`Cycle`: `round-each-invoice-line-total-to-cents-20260924T083000Z-5c9e2a71` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true`
`Status`: `APPROVED` `Verification Cadence`:
`AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `NONE`
- `Architecture`: `NONE`
- `Request`: `Round each invoice line total to cents before summing the invoice total.`

## Build Steps

### DEV-001 — Round line totals to cents before summing

`Status`: `PENDING` `Depends On`: `NONE` `Acceptance`: `EXPEDITED_REQUEST`

**Goal**

Make each line total a whole number of cents so the invoice total is the sum of
the amounts printed on its lines.

**Affected Area**

`lineTotal` and `invoiceTotal` in `src/totals.js`; `test/totals.test.js` for the
existing expectations.

**Expected Outcome**

`lineTotal` returns the product rounded to two decimal places, half away from
zero, and `invoiceTotal` sums those rounded line totals. `formatAmount` is
unchanged.

**Self-Check**

Planned: `npm test` (runs `node --test test/totals.test.js`) from the project
root after the change, plus a manual sanity check that
`invoiceTotal([{ quantity: 3, unitPrice: 0.335 }])` gives `1.01`. Not yet run.

## Plan Notes

The user approved this plan with no user style. Implementation has not started.

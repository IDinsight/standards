<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: summary-two-decimal-totals-20260924T083000Z-5c9e1a07
-->

# Development Plan

`Cycle`: `summary-two-decimal-totals-20260924T083000Z-5c9e1a07` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true` `Status`: `COMPLETE`
`Verification Cadence`: `AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `NONE`
- `Architecture`: `NONE`
- `Request`: `Show invoice summary subtotals and totals with exactly two decimal places.`

## Build Steps

### DEV-001 — Format the overall total with two decimals

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `EXPEDITED_REQUEST`

**Goal**

The `Total:` line of the summary always shows two decimal places, so floating
sums such as 0.1 + 0.2 print as `0.30`.

**Affected Area**

`src/summary.js` (`summarize`), `test/summary.test.js`.

**Expected Outcome**

`summarize([])` returns `Total: 0.00`; a total of 150 prints as `150.00`.

**Self-Check**

`node --test test/summary.test.js test/parse.test.js` in the project root on
commit `${COMMIT:Show summary totals with two decimal places}`; exit 0, 5 tests
passed, 0 failed.

### DEV-002 — Apply the same formatting to per-customer subtotals

`Status`: `DONE` `Depends On`: `DEV-001` `Acceptance`: `EXPEDITED_REQUEST`

**Goal**

Each customer line uses the same two-decimal formatting as the total.

**Affected Area**

`src/summary.js` (shared `money` helper), `test/summary.test.js`.

**Expected Outcome**

A customer with invoices of 100 prints as `Acme: 100.00`; customers stay in
alphabetical order.

**Self-Check**

Same run as DEV-001: `node --test test/summary.test.js test/parse.test.js` in the
project root on commit `${COMMIT:Show summary totals with two decimal places}`;
exit 0, 5 tests passed, 0 failed. `test/parse.test.js` is unchanged and still
passes.

**Implementation Notes**

Rounding uses `Number.prototype.toFixed(2)` at output time only; stored amounts
and sums are not rounded.

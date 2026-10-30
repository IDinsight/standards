<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: round-invoice-totals-20260924T090000Z-3c9e1a7b
-->

# Development Plan

`Cycle`: `round-invoice-totals-20260924T090000Z-3c9e1a7b` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true` `Status`: `APPROVED`
`Verification Cadence`: `AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `NONE`
- `Architecture`: `NONE`
- `Request`: `Show invoice totals in the summary line with exactly two decimal places.`

## Build Steps

### DEV-001 — Two-decimal total in summaryLine

`Status`: `PENDING` `Depends On`: `NONE` `Acceptance`: `EXPEDITED_REQUEST`

**Goal**

Format the total in `summaryLine` with exactly two decimal places, so sums such
as 0.1 + 0.2 no longer show floating-point noise in the summary text.

**Affected Area**

`src/summary.js` (`summaryLine`). `invoiceTotal` keeps returning the unrounded
number; `src/report.js` picks up the change through `summaryLine`.

**Expected Outcome**

`summaryLine` renders totals such as `31.50`, `0.30`, and `17.00`; the invoice
number, item count, and currency text are unchanged.

**Self-Check**

Planned: `node --test test/summary.test.js` from the project root, plus a
one-off `summaryLine` call with a fractional total.

---

## Plan Notes

Expedited cycle: one bounded formatting change in a single function; no new
dependencies.

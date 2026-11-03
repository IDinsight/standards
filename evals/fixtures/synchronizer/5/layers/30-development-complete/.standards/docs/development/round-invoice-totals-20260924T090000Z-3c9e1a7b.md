<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: round-invoice-totals-20260924T090000Z-3c9e1a7b
-->

# Development Plan

`Cycle`: `round-invoice-totals-20260924T090000Z-3c9e1a7b` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true` `Status`: `COMPLETE`
`Verification Cadence`: `AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `NONE`
- `Architecture`: `NONE`
- `Request`: `Show invoice totals in the summary line with exactly two decimal places.`

## Build Steps

### DEV-001 — Two-decimal total in summaryLine

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `EXPEDITED_REQUEST`

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

- `node --test test/summary.test.js` in the project root at commit
  `${COMMIT:Round invoice totals in summary line}`, clean working tree, Node 22:
  exit 0, 2 tests passed, 0 failed.
- One-off `node -e` call in the project root at the same commit: `summaryLine`
  for INV-12 (2 x 4.25 + 1 x 23, USD) printed
  `INV-12: 2 item(s), total USD 31.50`; lines totalling 0.1 + 0.2 printed
  `total USD 0.30`.
- Limitation: the existing tests do not assert the decimal format; the format
  was checked only by the one-off call.

**Implementation Notes**

`toFixed(2)` is applied in `summaryLine` only, so callers of `invoiceTotal`
still receive a number.

---

## Plan Notes

Expedited cycle: one bounded formatting change in a single function; no new
dependencies. Implementation commit:
`${COMMIT:Round invoice totals in summary line}`.

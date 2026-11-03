<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: show-negative-amounts-in-parentheses-20260924T090000Z-3c9e51a7
-->

# Development Plan

`Cycle`: `show-negative-amounts-in-parentheses-20260924T090000Z-3c9e51a7` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true`
`Status`: `IN_PROGRESS` `Verification Cadence`:
`AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `NONE`
- `Architecture`: `NONE`
- `Request`: `Show negative amounts in parentheses instead of a leading minus sign.`

## Build Steps

### DEV-001 — Parenthesized negative amounts in formatAmount

`Status`: `DONE` `Depends On`: `NONE`
`Acceptance`: `EXPEDITED_REQUEST`

**Goal**

`formatAmount` renders a negative amount as the positive amount wrapped in
parentheses, for example `($12.50)`, instead of `-$12.50`.

**Affected Area**

`src/format.js` (`formatAmount`). `src/receipt.js` uses `formatAmount` for line
items and the total and picks up the new form without changes.

**Expected Outcome**

- `formatAmount(-1250)` returns `($12.50)`; `formatAmount(-123456789)` returns
  `($1,234,567.89)`; a custom currency symbol stays inside the parentheses.
- Zero and positive amounts are unchanged (`$0.00`, `$12.50`).
- Receipts keep their 32-column layout for negative lines and totals.

**Self-Check**

- `node --test test/format.test.js test/receipt.test.js` in the project root on
  commit `${COMMIT:Show negative amounts in parentheses}` (`src/format.js` blob
  `${BLOB:src/format.js}`), clean working tree, Node 22: exit 0, 4 tests passed,
  0 failed.
- `node -e 'import("./src/format.js").then((m) => console.log(m.formatAmount(-1250), m.formatAmount(-123456789), m.formatAmount(0), m.formatAmount(-5, "€")))'`
  in the project root on the same commit: printed
  `($12.50) ($1,234,567.89) $0.00 (€0.05)`.
- Inspection of `src/receipt.js`: `pad()` measures the formatted string, so a
  negative line or total still fills exactly 32 columns.
- Limitation: the existing tests do not cover negative amounts; the negative
  cases rest on the sanity check above.

**Implementation Notes**

The sign is decided once from `cents < 0`; the body is built from the absolute
value so grouping and currency handling are shared with positive amounts.

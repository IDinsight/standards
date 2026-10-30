<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: show-negative-amounts-in-parentheses-20260924T090000Z-3c9e51a7
-->

# Development Plan

`Cycle`: `show-negative-amounts-in-parentheses-20260924T090000Z-3c9e51a7` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true`
`Status`: `APPROVED` `Verification Cadence`:
`AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `NONE`
- `Architecture`: `NONE`
- `Request`: `Show negative amounts in parentheses instead of a leading minus sign.`

## Build Steps

### DEV-001 — Parenthesized negative amounts in formatAmount

`Status`: `PENDING` `Depends On`: `NONE`
`Acceptance`: `EXPEDITED_REQUEST`

**Goal**

`formatAmount` renders a negative amount as the positive amount wrapped in
parentheses, for example `($12.50)`, instead of `-$12.50`.

**Affected Area**

`src/format.js` (`formatAmount`). `src/receipt.js` uses `formatAmount` for line
items and the total and should pick up the new form without changes.

**Expected Outcome**

- `formatAmount(-1250)` returns `($12.50)`; `formatAmount(-123456789)` returns
  `($1,234,567.89)`; a custom currency symbol stays inside the parentheses.
- Zero and positive amounts are unchanged (`$0.00`, `$12.50`).
- Receipts keep their 32-column layout for negative lines and totals.

**Self-Check**

Planned: run the existing suite with
`node --test test/format.test.js test/receipt.test.js` in the project root, and
a targeted `node -e` sanity check of negative, grouped, zero, and custom-currency
amounts, since the existing tests do not cover negative amounts.

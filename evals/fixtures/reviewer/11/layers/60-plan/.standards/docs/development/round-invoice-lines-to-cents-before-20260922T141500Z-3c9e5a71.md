<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: round-invoice-lines-to-cents-before-20260922T141500Z-3c9e5a71
-->

# Development Plan

`Cycle`: `round-invoice-lines-to-cents-before-20260922T141500Z-3c9e5a71` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true`
`Status`: `IN_PROGRESS` `Verification Cadence`: `AFTER_IMPLEMENTATION`
`Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/round-invoice-lines-to-cents-before-20260922T141500Z-3c9e5a71.md`
- `Architecture`: `.standards/docs/specs/round-invoice-lines-to-cents-before-20260922T141500Z-3c9e5a71.md`
- `Request`: `Round invoice lines to cents before summing.`

## Build Steps

### DEV-001 — Round line totals and the invoice total before summing

`Status`: `DONE` `Depends On`: `NONE`
`Acceptance`: `AC-001, AC-002`

**Goal**

Each line total is rounded before it is added, so the invoice total equals the
sum of the amounts on the lines.

**Affected Area**

`src/totals.js` (`lineTotal`, `invoiceTotal`).

**Expected Outcome**

`invoiceTotal` sums rounded line totals and rounds the sum. The rounding unit is
fixed at two decimals until DEV-002.

**Self-Check**

`node --test test/totals.test.js` in the project root on the working tree later
committed as "Round invoice lines to cents before summing": exit 0, 3 passed.
`node --input-type=module -e "import { lineTotal } from './src/totals.js'; console.log(lineTotal({ quantity: 3, unitPrice: 0.333 }))"`
printed `1`. Rerun after promotion on the same content: exit 0, 3 passed.

### DEV-002 — Round to the invoice currency's minor unit

`Status`: `PENDING` `Depends On`: `DEV-001`
`Acceptance`: `AC-001, AC-002`

**Goal**

Replace the fixed two-decimal rounding with the currency's minor unit from the
design's `MINOR_UNITS` table.

**Affected Area**

New `src/currencies.js`; `src/totals.js`.

**Expected Outcome**

USD and EUR round to two decimals, JPY to whole units, KWD to three decimals,
for both line totals and the invoice total.

**Self-Check**

Planned: `node --test test/totals.test.js` plus a JPY and a KWD `summarize`
sanity check from the project root.

### DEV-003 — Reject invoices in unsupported currencies

`Status`: `PENDING` `Depends On`: `DEV-002`
`Acceptance`: `AC-003`

**Goal**

`invoiceTotal` throws `UnsupportedCurrencyError` naming the code before any
arithmetic when the currency has no minor-unit entry.

**Affected Area**

`src/currencies.js`; `src/totals.js`.

**Expected Outcome**

`summarize` on a GBP invoice throws an error whose message contains `GBP`.

**Self-Check**

Planned: `node --test test/totals.test.js` plus a `summarize` call with an
unsupported code from the project root.

## Plan Notes

- Reconciled after promotion: DEV-001 remapped from `EXPEDITED_REQUEST` to
  AC-001 and AC-002 and kept `DONE`; DEV-002 and DEV-003 added for the scoped
  currency rules, addressing
  `.standards/docs/reviews/round-invoice-lines-to-cents-before-20260922T141500Z-3c9e5a71/implementation.md#F-001`.
  The user approved the revised plan.

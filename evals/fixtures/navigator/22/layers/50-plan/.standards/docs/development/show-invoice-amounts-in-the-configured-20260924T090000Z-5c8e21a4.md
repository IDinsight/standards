<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: show-invoice-amounts-in-the-configured-20260924T090000Z-5c8e21a4
-->

# Development Plan

`Cycle`: `show-invoice-amounts-in-the-configured-20260924T090000Z-5c8e21a4`
`Mode`: `AUTONOMOUS` `User Style`: `NONE` `User Style Locked`: `true`
`Status`: `APPROVED` `Verification Cadence`: `AFTER_IMPLEMENTATION`
`Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/show-invoice-amounts-in-the-configured-20260924T090000Z-5c8e21a4.md`
- `Architecture`: `.standards/docs/specs/show-invoice-amounts-in-the-configured-20260924T090000Z-5c8e21a4.md`
- `Request`: `Show invoice amounts in the configured currency.`

## Build Steps

### DEV-001 — Invoice totals in minor units

`Status`: `PENDING` `Depends On`: `NONE` `Acceptance`: `AC-001`

**Goal**

Compute invoice subtotal, tax, and total as integers in the currency's minor
unit.

**Affected Area**

`src/totals.js`: new `toMinor` and `invoiceTotalsMinor`; the existing
`invoiceTotals` stays as is for current callers.

**Expected Outcome**

`invoiceTotalsMinor(invoice, taxRate, decimals)` returns integer subtotal, tax,
and total; each line is rounded to the minor unit before summing and tax is
rounded once.

**Self-Check**

Planned: `node --test test/totals.test.js` from the project root.

### DEV-002 — Currency setting and money formatting module

`Status`: `PENDING` `Depends On`: `DEV-001` `Acceptance`: `AC-002, AC-003`

**Goal**

Read the currency code and decimal places from settings and format minor-unit
amounts for display.

**Affected Area**

`config/settings.json` (new `currency` object) and a new module
`src/format/money.js`; settings are read through `loadSettings` in
`src/config.js`.

**Expected Outcome**

`resolveCurrency` applies the `USD` / 2 default and `formatMoney(minor,
currency)` renders strings such as `EUR 1,234.50`.

**Self-Check**

Planned: `node src/cli.js` from the project root once DEV-003 uses the module.

### DEV-003 — Report and CLI show formatted amounts

`Status`: `PENDING` `Depends On`: `DEV-001, DEV-002` `Acceptance`: `AC-003`

**Goal**

Show every summary amount and the grand total in the configured currency.

**Affected Area**

`summaryLines` in `src/report.js` and the total line in `src/cli.js`.

**Expected Outcome**

Each summary line and the grand total use `invoiceTotalsMinor` and
`formatMoney` with the resolved currency.

**Self-Check**

Planned: `node --test test/totals.test.js test/report.test.js` and
`node src/cli.js` from the project root.

## Plan Notes

- Implementation baseline: `${COMMIT:Add invoice summary report}`
  (`Add invoice summary report`), the last project commit before this cycle.
  The installation and workflow-record commits after it change no project
  code.

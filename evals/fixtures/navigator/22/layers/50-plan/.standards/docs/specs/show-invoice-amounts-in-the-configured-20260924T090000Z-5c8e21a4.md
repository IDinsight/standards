<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: show-invoice-amounts-in-the-configured-20260924T090000Z-5c8e21a4
-->

# Technical Design

## Context

Totals are floating-point sums in `src/totals.js`; `src/report.js` and
`src/cli.js` format them with `toFixed(2)`. Settings are read by
`loadSettings` in `src/config.js`, which merges the file over defaults.

## Decision

- Keep `invoiceTotals` as is for existing callers and add minor-unit totals
  beside it in `src/totals.js`.
- Add a `currency` object to `config/settings.json`. `loadSettings` already
  passes unknown keys through, so the loader needs no change.
- Add a module `src/format/money.js` that resolves the currency (with the
  `USD` / 2 default) and formats minor-unit integers for display.
- Switch the report and CLI to minor-unit totals and the formatter.

## Acceptance Coverage

- `AC-001`: `toMinor` and `invoiceTotalsMinor` in `src/totals.js`.
- `AC-002`: `currency` setting in `config/settings.json`, read through
  `loadSettings`; defaults applied by `resolveCurrency`.
- `AC-003`: `formatMoney` used by `summaryLines` in `src/report.js` and by the
  total line in `src/cli.js`.

## Interfaces and Contracts

- `config/settings.json`: optional `"currency": { "code": string, "decimals":
  integer }`.
- `toMinor(amount, decimals = 2)`: `Math.round(amount * 10 ** decimals)`.
- `invoiceTotalsMinor(invoice, taxRate, decimals = 2)`: integers `subtotal`,
  `tax`, `total`; each line rounded with `toMinor`, tax rounded once on the
  subtotal.
- `resolveCurrency(currency)`: `{ code, decimals }`, defaulting to `USD` and 2.
- `formatMoney(minor, currency)`: `<code> <grouped whole>.<fraction>`, with a
  leading `-` for negative amounts.

## Technical Acceptance Criteria

- `AC-001`: Totals from `invoiceTotalsMinor` are integers and equal the sum of
  rounded line amounts plus the rounded tax.
- `AC-002`: A settings file without `currency` yields `USD` with 2 decimals.
- `AC-003`: Report lines and the CLI total use `formatMoney` with the resolved
  currency.

## Build Plan

1. Minor-unit totals in `src/totals.js`.
2. Currency setting and the formatting module.
3. Report and CLI switched to the new totals and formatter.

<!-- STANDARDS
Artifact: SCOPE
Cycle: show-invoice-amounts-in-the-configured-20260924T090000Z-5c8e21a4
-->

# Currency Display for Invoice Amounts

## Goal

The invoice summary prints amounts as bare decimals with no currency, and
floating-point sums can carry rounding remainders. Show every amount in the
company's configured currency, rounded to that currency's smallest unit.

## Constraints

- The currency is configured in `config/settings.json`, which already holds the
  company name and tax rate.
- Existing callers of `invoiceTotals` keep working unchanged.

## Non-goals

- Converting amounts between currencies.
- Per-customer or per-invoice currencies.

## Work

### 1. Exact amounts

**Intent:** Totals must not drift from what a customer would calculate by hand.

**Done when:**

- `AC-001`: Invoice subtotal, tax, and total are computed exactly in the
  currency's minor unit, with each line amount rounded to that unit before
  summing.

**Depends on:** None

### 2. Configured currency

**Intent:** Readers of the summary see which currency the amounts are in.

**Done when:**

- `AC-002`: The currency code and number of decimal places come from
  `config/settings.json`; when the setting is absent, amounts use `USD` with 2
  decimal places.
- `AC-003`: The summary report and the CLI total show each amount with its
  currency code and thousands separators, for example `EUR 1,234.50`.

**Depends on:** 1

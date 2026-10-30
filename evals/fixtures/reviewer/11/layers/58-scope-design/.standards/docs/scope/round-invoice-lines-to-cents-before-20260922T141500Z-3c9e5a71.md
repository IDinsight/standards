<!-- STANDARDS
Artifact: SCOPE
Cycle: round-invoice-lines-to-cents-before-20260922T141500Z-3c9e5a71
-->

# Per-Currency Invoice Rounding

## Goal

Invoice totals must be amounts that can actually be charged in the invoice's
currency, and the invoice total must match the sum of the amounts shown on its
lines.

## Constraints

- Amounts stay in major currency units; the shape returned by `summarize` does
  not change.
- Supported currencies are USD, EUR, JPY, and KWD.

## Non-goals

- Currency conversion.
- Display formatting of amounts.

## Work

### 1. Round to the currency's minor unit

**Intent:** Every line and the total must be expressible in the invoice
currency.

**Done when:**

- `AC-001`: Each line total is rounded half up to the minor unit of the invoice
  currency: two decimals for USD and EUR, none for JPY, three for KWD.
- `AC-002`: The invoice total equals the sum of the rounded line totals,
  expressed in the same minor unit.

**Depends on:** None

### 2. Reject unsupported currencies

**Intent:** An invoice in a currency without a defined rounding rule must not
produce a total.

**Done when:**

- `AC-003`: An invoice whose currency is not USD, EUR, JPY, or KWD is rejected
  with an error naming the currency, and no total is returned.

**Depends on:** 1

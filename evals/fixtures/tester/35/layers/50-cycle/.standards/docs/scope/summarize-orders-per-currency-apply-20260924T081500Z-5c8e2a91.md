<!-- STANDARDS
Artifact: SCOPE
Cycle: summarize-orders-per-currency-apply-20260924T081500Z-5c8e2a91
-->

# Per-Currency Order Summary

## Goal

The shop now sells in several currencies, and its export carries a `currency`
column and a `type` column that marks refunds. The summary still adds every
amount for a customer together. It must report correct totals per customer and
currency, and the billing team needs a machine-readable form.

## Constraints

- The export format is fixed: header row, unquoted comma-separated values,
  positive amounts, `type` either `sale` or `refund`. Older exports have no
  `currency` or `type` column and must keep working.
- No new runtime dependencies.

## Non-goals

- Currency conversion.

## Work

### 1. Currency-aware totals

**Intent:** Totals must match what customers were actually charged.

**Done when:**

- `AC-001`: Each order's currency is taken from the export's `currency` column, uppercased; an order with an empty or missing currency is treated as `USD`.
- `AC-002`: The summary has exactly one total per customer and currency, and amounts in different currencies are never added together.
- `AC-003`: An order whose `type` is `refund` reduces its customer's total in its currency by its amount instead of increasing it.

**Depends on:** None

### 2. Output for people and for the ledger

**Intent:** The billing team imports the summary into its ledger.

**Done when:**

- `AC-004`: `order-summary <file>` prints one line per customer and currency with the customer, currency, and total, and `order-summary --format json <file>` prints the same rows as a JSON array of objects with `customer`, `currency`, and `total`; both list rows ordered by customer and then currency.

**Depends on:** Work item 1.

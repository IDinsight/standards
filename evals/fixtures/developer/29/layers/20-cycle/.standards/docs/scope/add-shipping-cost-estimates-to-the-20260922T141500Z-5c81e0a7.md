<!-- STANDARDS
Artifact: SCOPE
Cycle: add-shipping-cost-estimates-to-the-20260922T141500Z-5c81e0a7
-->

# Shipping Cost Estimates

## Goal

Operations want the weekly parcel summary to show what shipping to each destination costs, so they can compare carrier invoices against the published rate card without a spreadsheet.

## Constraints

- Prices follow the published 2026 rate card already in the project, including the fuel surcharge.
- Amounts are in EUR.

## Non-goals

- Changing the rate card or the zone assignments.
- Currency conversion or VAT.
- Handling destinations that have no zone; they keep failing as they do today.

## Work

### 1. Per-parcel price

**Intent:** Every parcel gets a price that matches what the rate card says it should cost.

**Done when:**

- `AC-001`: Each parcel's price equals the zone base price plus the zone per-kilogram price times the billable kilograms, plus the fuel surcharge on that amount, rounded to the nearest cent with halves rounded up. Billable kilograms are the weight rounded up to whole kilograms, with a minimum of 1.

**Depends on:** None.

### 2. Destination totals

**Intent:** The summary and the printed report show the total shipping cost per destination.

**Done when:**

- `AC-002`: The summary reports, for each destination, the total price of its parcels in EUR to the cent.
- `AC-003`: The command-line report shows each destination's total in a `cost_eur` column with two decimals.

**Depends on:** 1.

<!-- STANDARDS
Artifact: SCOPE
Cycle: quantity-discounts-20260921T140512Z-6e2b9a41
-->

# Quantity Discount Tiers

## Goal

Order lines bought in volume get a lower price, and promo codes keep working on
top of those discounts with a predictable result, so customers and support staff
see the same totals everywhere.

## Constraints

- Tier thresholds and rates are as requested: 5% from 10 units, 10% from 50
  units, 15% from 100 units.
- Existing promo codes and their percentages are unchanged; unknown codes stay
  ignored.
- Orders with no discounted lines and no promo code keep their current totals.

## Non-goals

- New promo codes, per-customer pricing, or configurable tiers.
- Tax and currency conversion.

## Work

### 1. Tiered line pricing

**Intent:** Volume buyers pay less per line, and every line total is an exact
cent amount derived from the whole line.

**Done when:**

- `AC-001`: A line's total applies the discount tier for its quantity: 5% from
  10 units, 10% from 50 units, 15% from 100 units, and none below 10.
- `AC-003`: Each discounted line total is rounded to the cent once, from the
  full line amount, not per unit.

**Depends on:** None

### 2. Promo codes with discounted lines

**Intent:** Promo codes combine with quantity discounts in one documented way,
and callers can show the breakdown.

**Done when:**

- `AC-002`: A promo code percentage applies to the sum of the discounted line
  totals.
- `AC-004`: A priced order reports each line's discount amount, the subtotal,
  the promo discount, and the order total.

**Depends on:** 1

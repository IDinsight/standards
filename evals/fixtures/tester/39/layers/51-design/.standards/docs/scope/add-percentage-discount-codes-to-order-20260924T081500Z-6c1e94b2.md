<!-- STANDARDS
Artifact: SCOPE
Cycle: add-percentage-discount-codes-to-order-20260924T081500Z-6c1e94b2
-->

# Percentage Discount Codes

## Goal

Let checkout apply a percentage discount code to an order so customers pay the
reduced price and tax on the reduced amount.

## Constraints

- Callers that pass no discount code keep the same subtotal, tax, and total.
- Codes are a fixed list kept in the repository.

## Non-goals

- Fixed-amount discounts, stacking several codes, or per-item discounts.
- Creating, editing, or retiring codes at runtime.

## Work

### 1. Apply a discount code

**Intent:** Customers with a valid code pay the discounted price and tax on
that price.

**Done when:**

- `AC-001`: A valid discount code reduces the order subtotal by the code's
  percentage before tax is calculated, and the result reports the discount
  amount.
- `AC-002`: An unknown or expired discount code is rejected with an error that
  names the code, and no totals are returned.
- `AC-003`: A code is accepted through the end of its expiry date and is
  matched regardless of letter case or surrounding spaces.

**Depends on:** None

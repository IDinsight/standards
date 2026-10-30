<!-- STANDARDS
Artifact: SCOPE
Cycle: add-discount-codes-to-checkout-totals-20260924T083000Z-3c9e5a1f
-->

# Discount Codes at Checkout

## Goal

Let shoppers apply a discount code at checkout so promotions can run without
manual price changes.

## Constraints

- Amounts stay in integer cents, as in the existing totals module.
- Tax keeps the existing 8% rate.

## Non-goals

- Creating or editing codes through an admin interface.
- Applying more than one code to an order.

## Work

### 1. Apply a discount code to an order

**Intent:** Shoppers with a valid promotion code pay the discounted price.

**Done when:**

- `AC-001`: A shopper can supply a discount code with an order; codes match regardless of letter case and surrounding spaces.
- `AC-002`: A valid percent or fixed-amount code reduces the order total, a fixed amount never takes the total below zero, and tax is charged on the discounted amount.
- `AC-003`: An unknown or expired code is rejected with an error that names the code, and no totals are returned for that request.

**Depends on:** None

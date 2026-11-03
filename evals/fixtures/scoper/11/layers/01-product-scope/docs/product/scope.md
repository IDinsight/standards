# Account Portal: Product Scope

Owner: Product. This document is the canonical description of what the
account portal covers. Changes to customer-facing behavior or copy are scoped
here before implementation starts.

## Goal

Give signed-in customers a clear, accurate view of their subscription and a
way to manage it without contacting support.

## Constraints

- Customer-facing copy is written in US English.
- Prices are shown in USD with two decimal places.

## Non-goals

- Collecting or storing payment details. Card entry happens on the payment
  provider's hosted page; the portal never handles card data.
- Invoices and receipts, which customers receive by email.

## Billing summary

The billing summary shows the customer's current plan name, the monthly price,
the date the subscription renews, and an action to cancel.

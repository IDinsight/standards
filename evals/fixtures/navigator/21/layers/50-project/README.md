# order-pricing

Order totals and receipts for the shop backend. All amounts are integer cents.

- `src/cart.js`: line totals and order subtotal
- `src/pricing.js`: `totals(items, { taxRate })` returns subtotal, tax, and total
- `src/receipt.js`: plain-text receipts

Run the tests with `npm test`.

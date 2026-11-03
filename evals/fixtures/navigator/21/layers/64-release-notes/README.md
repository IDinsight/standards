# order-pricing

Order totals, receipts, and invoice export for the shop backend. All amounts
are integer cents.

- `src/cart.js`: line totals and order subtotal
- `src/discounts.js`: discount code catalogue and discount amounts
- `src/pricing.js`: `totals(items, { taxRate, code })` returns subtotal, discount, tax, and total
- `src/receipt.js`: plain-text receipts
- `src/invoice-export.js`: CSV export of order totals for accounting

Run the tests with `npm test`.

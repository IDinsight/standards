# ledgerline

In-process invoicing core: invoice storage, totals and balances, payments, and
line-item edits.

- `src/store.js`: in-memory invoice store
- `src/cache.js`: read-through cache for invoice summaries; entries expire after five minutes
- `src/invoices.js`: `InvoiceService`, which reads invoices with their totals and balances
- `src/payments.js`: record payments against open invoices
- `src/lineItems.js`: edit an invoice's line items

Amounts are integer cents. Invoices are `open` or `void`; void invoices accept
no payments.

## Tests

```
npm test
```

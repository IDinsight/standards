# ledgerline

In-process invoicing core: invoice storage and summaries with totals and balances.

- `src/store.js`: in-memory invoice store
- `src/cache.js`: read-through cache for invoice summaries; entries expire after five minutes
- `src/invoices.js`: `InvoiceService`, which reads invoices with their totals and balances

Amounts are integer cents.

## Tests

```
npm test
```

# invoicing

Builds immutable invoices from line items and computes subtotal, tax, and
total in integer cents.

```js
import { createInvoice, totals } from './src/invoice.js';

const invoice = createInvoice({
  customer: 'ACME',
  taxRatePercent: 8,
  lines: [{ description: 'Widget', quantity: 3, unitPrice: '4.99' }],
});
totals(invoice); // subtotalCents, taxCents, totalCents
```

Unit prices are decimal strings with at most two fraction digits.

Run the tests with `npm test`.

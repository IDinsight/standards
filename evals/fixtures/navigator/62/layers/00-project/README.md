# invoice-tools

Small helpers for computing invoice totals.

## Usage

```js
import { invoiceTotal } from './src/totals.js';

invoiceTotal([{ quantity: 2, unitPrice: 10 }], { taxRate: 0.08 });
// { subtotal: 20, tax: 1.6, total: 21.6 }
```

Options:

- `taxRate` (default `0`): fraction of the subtotal added as tax.

Amounts are rounded to cents.

## Tests

```
npm test
```

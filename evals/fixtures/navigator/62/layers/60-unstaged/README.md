# invoice-tools

Small helpers for computing invoice totals.

## Usage

```js
import { invoiceTotal } from './src/totals.js';

invoiceTotal([{ quantity: 4, unitPrice: 25 }], { taxRate: 0.08, discountRate: 0.1 });
// { subtotal: 100, discount: 10, tax: 7.2, total: 97.2 }
```

Options:

- `taxRate` (default `0`): fraction of the discounted subtotal added as tax.
- `discountRate` (default `0`): fraction of the subtotal taken off before tax.
  Must be between 0 and 1; other values throw a `RangeError`.

Amounts are rounded to cents.

## Tests

```
npm test
```

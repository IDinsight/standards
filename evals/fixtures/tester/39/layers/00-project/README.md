# ordercalc

Order total calculation for the checkout service.

## Usage

```js
import { orderTotals } from './src/totals.js';

orderTotals([{ price: 20, quantity: 2 }]);
// { subtotal: 40, tax: 3.2, total: 43.2 }
```

Tax is a flat 8% of the subtotal. Amounts are rounded to cents.

## Tests

```sh
npm test
```

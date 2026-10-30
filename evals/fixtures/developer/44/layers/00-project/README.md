# orders

Order total calculation for the shop checkout. All prices are integer cents.

## Usage

```js
import { orderTotal } from './src/totals.js';

orderTotal([{ sku: 'TEA-01', qty: 2, unitCents: 450 }]); // 900
```

Run the tests with `npm test`.

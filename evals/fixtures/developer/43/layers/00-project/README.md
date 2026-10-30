# receipts

Formats money amounts and renders plain-text receipts for the shop counter
printer (32 columns).

Amounts are integer cents. Refunds and discounts are entered as negative cents.

```js
import { renderReceipt } from './src/receipt.js';

console.log(renderReceipt([
  { label: 'Coffee', cents: 350 },
  { label: 'Bagel', cents: 275 },
]));
```

Run the tests with `npm test`.

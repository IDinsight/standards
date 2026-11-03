# ordercalc

Order total calculation for the checkout service.

## Usage

```js
import { orderTotals } from './src/totals.js';

const cart = [
  { price: 20, quantity: 2 },
  { price: 10, quantity: 1 },
];

orderTotals(cart);
// { subtotal: 50, discount: 0, tax: 4, total: 54 }

orderTotals(cart, { discountCode: 'SPRING10' });
// { subtotal: 50, discount: 5, tax: 3.6, total: 48.6 }
```

Tax is a flat 8% of the subtotal after any discount. Amounts are rounded to
cents.

## Discount codes

- Pass `discountCode` in the second argument. Codes are matched regardless of
  letter case and surrounding spaces.
- The code's percentage is taken off the subtotal before tax, and `discount`
  reports the amount taken off (`0` without a code).
- A code is valid through the end of its expiry date. Codes are checked against
  `today`, an ISO `YYYY-MM-DD` date that defaults to the current UTC date.
- An unknown or expired code throws `DiscountError` (from `src/discounts.js`);
  its message names the code and no totals are returned.

The available codes and their expiry dates are listed in `src/discounts.js`.

## Tests

```sh
npm test
```

# parcel-rates

Shipping cost calculator used by the checkout service.

## Usage

```js
import { shippingCost } from './src/rates.js';

shippingCost({ zone: 'domestic', weightKg: 2.3 }); // 7.8
```

`shippingCost(order, options)` takes the order (`zone`, `weightKg`, and
optionally `orderTotal`) and an optional options object.

Every shipment pays its zone's base charge plus a per-kilogram charge. The
weight is rounded up to the next whole kilogram, and the result is rounded to
cents.

| Zone            | Base  | Per kg |
| --------------- | ----- | ------ |
| `domestic`      | 4.50  | 1.10   |
| `regional`      | 7.25  | 1.60   |
| `international` | 15.00 | 3.40   |

`shippingCost` throws `RangeError` for an unknown zone or a weight that is not
greater than 0.

### Free shipping

Pass `freeShippingThreshold` in the second argument to waive the charge on
larger orders:

```js
shippingCost(
  { zone: 'domestic', weightKg: 2.3, orderTotal: 60 },
  { freeShippingThreshold: 50 },
); // 0
```

- Domestic and regional shipments cost 0 when `orderTotal` is equal to or
  greater than the threshold. `orderTotal` defaults to 0.
- International shipments are always charged, whatever the order total.
- A threshold that is negative or not a finite number throws `RangeError`.
- Without the option, every shipment is charged as shown above.

## Tests

```sh
npm test
```

# parcel-rates

Shipping cost calculator used by the checkout service.

## Usage

```js
import { shippingCost } from './src/rates.js';

shippingCost({ zone: 'domestic', weightKg: 2.3 }); // 7.8
```

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

## Tests

```sh
npm test
```

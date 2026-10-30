# parcel-rates

Shipping quote calculator used by the checkout service.

```js
import { quote } from './src/rates.js';

quote({ zone: 'domestic', weightKg: 2.3 });
// { zone: 'domestic', weightKg: 2.3, lines: [...], total: 845 }
```

All amounts are integer cents. Weight is charged per started kilogram.

Zones: `domestic`, `regional`, `international`.

Run the tests with `npm test`.

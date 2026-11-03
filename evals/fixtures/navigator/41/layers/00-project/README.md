# order-tools

Small utilities for working with exported order files.

- `src/orders.js` loads an orders JSON file (an array of orders).
- `src/money.js` formats integer cents as decimal strings.

Orders carry `id`, `customer`, `totalCents`, `placedAt` (ISO 8601 with any
offset), and `lines` (`sku`, `quantity`, `priceCents`).

Run the tests with `npm test`.

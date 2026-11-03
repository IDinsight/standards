# invoice-totals

Small library for computing invoice totals. All amounts are integer cents to
avoid floating-point rounding drift.

## API

- `lineTotalCents({ unitPriceCents, quantity })`: price times quantity. Throws
  `RangeError` for a negative or non-integer price, or a quantity that is not a
  positive integer.
- `applyDiscount(subtotalCents, discount)`: `discount` is `undefined`,
  `{ type: 'percent', value }`, or `{ type: 'fixed', valueCents }`. Fixed
  discounts never take the subtotal below zero.
- `invoiceTotal(items, { discount, taxRate })`: returns
  `{ subtotal, discounted, tax, total }`. Tax is applied after the discount and
  rounded to the nearest cent.
- `formatCents(cents)`: renders cents as a decimal string such as `29.15`.

## Tests

```
npm test
```

# inventory-tools

Helpers for reading warehouse stock exports.

- `parseInventory(text)` reads a CSV export with columns
  `sku,name,quantity,reorder_level`.
- `totalUnits(items)` sums quantities.

Run the tests with `npm test`.

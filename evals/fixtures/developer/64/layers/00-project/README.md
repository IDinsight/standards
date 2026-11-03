# stockroom

In-memory inventory helpers for the stockroom team.

- `src/inventory.js`: create an inventory, add items, adjust quantities, list items.
- `src/report.js`: read-only reports over an inventory.

Each item is `{ sku, name, quantity, reorderLevel }`; `reorderLevel` is a number
or `null` when no reorder level is set.

Run the tests with `npm test`.

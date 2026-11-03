# stockroom

Inventory helpers for the warehouse tools: load item records, adjust
quantities, and total stock.

Items are plain objects `{ sku, name, quantity, reorderLevel }`. Every helper
is a pure function that returns new values and never modifies its input.

Run the tests with `npm test`.

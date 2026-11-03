# stockroom

Prints a low-stock report from an inventory JSON file.

    node src/cli.js data/inventory.sample.json

Each inventory item has `sku`, `name`, `category`, and `quantity`. An item is
listed when its quantity is at or below its reorder level. Rows are printed as
tab-separated `sku`, `name`, `quantity`.

Run the tests with `npm test`.

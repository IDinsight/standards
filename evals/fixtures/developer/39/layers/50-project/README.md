# stock

Command-line helper for the warehouse inventory sheet.

    node src/cli.js list data/inventory.csv

The inventory file is CSV with `sku,name,qty,reorderAt` columns; lines
starting with `#` are comments and blank lines are ignored.

Run the tests with `npm test`.

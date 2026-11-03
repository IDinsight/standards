# stockroom

Prints a stock report from a comma-separated inventory file.

    node src/cli.js data/stock.csv

Each row is `sku, name, quantity`. Lines starting with `#` are comments.
The report lists items sorted by SKU and ends with an item count.

Run the tests with `npm test`.

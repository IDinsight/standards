# stockroom

Small command-line tool for the workshop stock sheet.

```sh
node src/cli.js data/sample.csv
```

The input is a CSV with a `sku,name,qty` header. The tool prints every item as
`sku,name,qty` followed by a `total,<units>` line.

Run the tests with `node --test test/inventory.test.js` (or `npm test`).

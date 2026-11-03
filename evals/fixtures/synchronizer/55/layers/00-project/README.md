# ledger

Prints per-category totals from a CSV ledger.

```sh
node src/cli.js summary data/sample.csv
```

The ledger file starts with the header `date,amount,category`; dates use
`YYYY-MM-DD` and amounts are plain numbers. Totals print as
`category<TAB>amount`, sorted by category.

Run the tests with `npm test`.

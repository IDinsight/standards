# ledgerline

Reads a bank statement exported as CSV and prints monthly totals.

```sh
node bin/ledgerline.js import examples/statement.csv
node bin/ledgerline.js summary examples/statement.csv --month 2026-08
```

The exit code is non-zero on error.

Run the tests with `npm test`.

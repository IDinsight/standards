# ledger-cli

Summarize an invoice CSV file by customer.

```
node bin/ledger.js invoices.csv
```

Each line of the input is `id,customer,amount`. Blank lines and lines starting
with `#` are ignored. The output lists customers alphabetically with their
subtotal, followed by the overall total.

Run the tests with `npm test`.

# Getting started

Run ledgerline with the path to a ledger file:

```sh
node src/cli.js ledger.csv
```

Each line of the ledger is a date, an account, and an amount:

```text
2026-01-02,rent,-900
2026-01-03,salary,2500
2026-01-09,rent,-15.5
```

ledgerline prints one total per account:

```text
rent	-915.50 USD
salary	2500.00 USD
```

:::note
The currency, date format, and other settings come from `ledgerline.json`;
see [Configuration](configuration.md).
:::

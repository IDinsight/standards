# Producing account balance reports

## Who this guide is for

This guide is for support staff who pull account balance reports from a
terminal. You need Python 3 and a checkout of this repository. Run every
command from the repository root.

## Producing a CSV report

Pass the ledger file to the `export` command:

    python3 -m acctreport export data/ledger.csv

The report is printed to standard output as CSV. To keep it, redirect it to a
file:

    python3 -m acctreport export data/ledger.csv > balances.csv

The report has one header row and one row per account, sorted by account ID.
Its columns are:

- `account_id`: the account ID from the ledger.
- `name`: the account name, taken from the account's last ledger row.
- `balance`: the sum of all of the account's ledger amounts, with two decimal
  places. Negative amounts reduce the balance.

For the sample ledger in `data/ledger.csv`, the output is:

```text
account_id,name,balance
A-100,Harbor Supplies,100.00
A-200,Lakeside Bakery,45.50
A-300,Pine Street Clinic,310.25
```

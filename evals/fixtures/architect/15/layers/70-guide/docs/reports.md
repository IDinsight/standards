# Running reports

`tally report` reads a ledger CSV file with the columns `date`, `account`, and
`amount`, and prints a total for each account.

## Running the report

From the project root:

    python3 -m tally report examples/sample.csv

If the ledger file does not exist, tally prints
`tally: ledger file not found: <path>` to standard error and exits with status
2. A row whose amount cannot be read stops the report with
`tally: line N: invalid amount`, also with exit status 2.

## Output

The report prints one line per account, sorted by account name. Each line holds
the account name and its total, separated by a tab, with no header line. For
`examples/sample.csv`:

    groceries	59.35
    rent	900.00
    transport	12.40

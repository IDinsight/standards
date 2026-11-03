# tally

Small command-line tool for summarizing a household ledger kept as CSV.

## Usage

    python3 -m tally report examples/sample.csv

`tally report` prints one tab-separated line per account with the account total.

## Tests

    python3 -m pytest

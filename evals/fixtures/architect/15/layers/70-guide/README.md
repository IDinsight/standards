# tally

Small command-line tool for summarizing a household ledger kept as CSV.

## Usage

    python3 -m tally report examples/sample.csv

`tally report` prints one tab-separated line per account with the account total.
See [docs/reports.md](docs/reports.md) for the full report guide.

## Tests

    python3 -m pytest

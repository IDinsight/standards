# tally

Summarize a numeric column of a CSV file from the command line.

    python3 -m tally examples/sales.csv --column amount --group-by region

Run `python3 -m tally --help` for all options.

## Development

    python3 -m pytest

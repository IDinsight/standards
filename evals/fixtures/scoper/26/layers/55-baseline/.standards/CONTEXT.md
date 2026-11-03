# Project Context

## Project Baseline

- `acctreport` is a small Python command-line tool that totals a ledger CSV
  into per-account balances. It has one subcommand, `export`.

## Stack and Tooling

- Python 3 standard library only (`argparse`, `csv`, `json`, `decimal`).
  Tests use pytest.

## Structure and Boundaries

- `acctreport/cli.py` — argument parsing: `export <ledger> [--format csv|json]`,
  default `csv`; writes the report to standard output.
- `acctreport/report.py` — `load_ledger`, `summarize`, `to_csv`, `to_json`.
- `data/ledger.csv` — sample ledger used in the README.
- `README.md` — short usage notes; no user guide exists yet.

## Commands

- `python3 -m pytest` — runs `tests/test_report.py`.
- `python3 -m acctreport export data/ledger.csv` — CSV balances for the sample
  ledger.
- `python3 -m acctreport export --format json data/ledger.csv` — the same
  balances as JSON.

## Relevant Existing Behavior

- Ledger input: CSV with header `account_id,name,amount`; amounts are decimal
  strings and may be negative.
- Balances: amounts summed per `account_id` and formatted with two decimal
  places; rows sorted by `account_id`; the name comes from the account's last
  ledger row.
- CSV output: header `account_id,name,balance`, one row per account, newline
  line endings.
- JSON output: one object with `count` (number of accounts) and `accounts`, an
  array of objects with `account_id`, `name`, and `balance`; `balance` is a
  string such as `"100.00"`. Indented two spaces, trailing newline.
- An unknown `--format` value is rejected by argparse with exit status 2.

## Testing and Verification Baseline

- `tests/test_report.py` covers summarizing, CSV output, and JSON output; 3
  tests, all passing.

## Evidence

- `acctreport/cli.py`, `acctreport/report.py`, `tests/test_report.py`,
  `data/ledger.csv`; `python3 -m pytest` (3 passed).

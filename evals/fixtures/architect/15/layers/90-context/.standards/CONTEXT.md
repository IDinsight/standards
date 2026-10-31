# Project Context

## Project Baseline

- `tally` is a small Python command-line tool that summarizes a household
  ledger CSV by account. This documentation cycle covers the existing
  `tally report` command.

## Stack and Tooling

- Python 3 standard library only; tests use pytest.

## Structure and Boundaries

- `tally/cli.py` — argument parsing for the `report` subcommand and exit codes.
- `tally/ledger.py` — reads the ledger CSV (`date`, `account`, `amount`) into
  entries; raises `LedgerError` for a missing file or an unreadable amount.
- `tally/report.py` — `summarize` groups entries by account; `write_report`
  writes the report with `csv.writer`.
- `docs/reports.md` — report guide written in this cycle.

## Commands

- `python3 -m tally report <ledger.csv> [--account NAME]` — print the report.
- `python3 -m pytest` — run the tests.

## Testing and Verification Baseline

- `tests/test_report.py` covers grouping, the account filter, and the exact
  writer output (`test_write_report_csv_with_header`); `tests/test_cli.py`
  covers the missing-file exit status.

## Relevant Existing Behavior

- `tally report` writes CSV to standard output: a header row
  `account,entries,total`, then one comma-separated row per account sorted by
  account name. `entries` is the number of ledger rows for the account; `total`
  is their sum with two decimal places. For `examples/sample.csv` the rows are
  `groceries,2,59.35`, `rent,1,900.00`, `transport,1,12.40`.
- `--account NAME` limits the report to that account; the header row is still
  written.
- Missing ledger file: `tally: ledger file not found: <path>` on standard
  error, exit status 2. Unreadable amount: `tally: line N: invalid amount`,
  exit status 2. Success exits 0.
- `README.md` still describes tab-separated output. That describes the report
  before commit "Write reports as CSV with a header row" and is not evidence of
  current behavior.

## Evidence

- `tally/report.py` — header, delimiter, columns, and total formatting.
- `tests/test_report.py::test_write_report_csv_with_header` — exact output.
- `python3 -m tally report examples/sample.csv` in the project root, exit 0 —
  first line `account,entries,total`.
- `tally/cli.py`, `tally/ledger.py` — invocation, filter, and error paths.
- `git log -- tally/report.py` — the switch from tab-separated to CSV output.

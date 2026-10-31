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
- `tally/report.py` — groups entries by account and writes the report.
- `docs/` — does not exist yet; no report guide.

## Commands

- `python3 -m tally report <ledger.csv> [--account NAME]` — print the report.
- `python3 -m pytest` — run the tests.

## Testing and Verification Baseline

- `tests/test_report.py` covers grouping, the account filter, and the writer;
  `tests/test_cli.py` covers the missing-file exit status.

## Relevant Existing Behavior

- `tally report` prints one tab-separated line per account (account, total),
  sorted by account name, with no header line.
- `--account NAME` limits the report to that account.
- Missing ledger file: `tally: ledger file not found: <path>` on standard
  error, exit status 2. Unreadable amount: `tally: line N: invalid amount`,
  exit status 2.

## Evidence

- `README.md` usage section — report output format.
- `tally/cli.py`, `tally/ledger.py` — invocation, filter, and error paths.

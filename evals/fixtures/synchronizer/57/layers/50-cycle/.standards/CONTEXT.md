# Project Context

## Project Baseline

- `tally` is a small Python command-line tool that totals expense CSV files.
  This cycle documents its existing behavior; no implementation change is
  planned.

## Stack and Tooling

- Python 3 (invoked as `python3`), standard library only (`argparse`, `csv`,
  `decimal`); pytest for tests (`pytest.ini` sets `testpaths = tests` and
  `pythonpath = .`).

## Structure and Boundaries

- `tally/__main__.py` — CLI entry point: `summary` and `check` subcommands and
  their exit statuses.
- `tally/ledger.py` — CSV loading and validation (`REQUIRED_COLUMNS`,
  `load_rows`), blank-category detection, totals.
- `docs/usage.md` — the user guide; `README.md` links to it. It currently
  covers only the default `summary` invocation.
- `data/expenses.csv` — example input with 8 rows over two months.

## Commands

- `python3 -m pytest` — runs the tests in `tests/` from the repository root.
- `python3 -m tally summary data/expenses.csv` — totals by category for the
  example file.

## Relevant Existing Behavior

- `summary PATH [--by category|month]` prints one tab-separated line per key,
  sorted by key; the default grouping is `category`.
- `check PATH [--strict]` prints `ok: N rows` and exits 0. With `--strict`, rows
  with a blank category are reported on standard error and the exit status is
  1.
- A missing file, a missing required column, or a non-numeric amount prints
  `error: <reason>` on standard error and exits 2; argparse usage errors also
  exit 2.

## Testing and Verification Baseline

- `tests/test_ledger.py` covers totals, missing columns, bad amounts, and blank
  categories; `tests/test_cli.py` covers category output, `check`, unreadable
  files, and `--strict`. Month output of the CLI is covered only through
  `totals`.

## Evidence

- `tally/__main__.py`, `tally/ledger.py` — command contracts and exit statuses.
- `tests/` — existing behavior assertions.
- `docs/usage.md` — current guide content.

# Project Context

## Project Baseline

- csvsum is a small command-line tool that prints count, minimum, maximum, and
  mean for the numeric columns of a CSV file. Implementation, tests, and a
  sample data file are committed. Before this cycle the only documentation is a
  short README with no usage section.

## Stack and Tooling

- Python 3 standard library only (`argparse`, `csv`). No packaging metadata;
  the tool runs as a module with `python3 -m csvsum` from the repository root.
- Tests use pytest, configured by `pytest.ini` (`testpaths = tests`,
  `pythonpath = .`).

## Structure and Boundaries

- `csvsum/cli.py` — argument parsing, file opening, error messages, output
  formatting, and exit status.
- `csvsum/summary.py` — `summarize(handle, columns=None, delimiter=",")`: reads
  with `csv.DictReader`, validates requested columns, collects numeric cells.
- `csvsum/__main__.py` — module entry point.
- `examples/orders.csv` — sample input with numeric, text, blank, and `n/a`
  cells.
- `tests/` — pytest tests for `summarize` and `main`.

## Commands

- `python3 -m pytest -q` — runs all tests (7 tests at audit time, all passing).
- `python3 -m csvsum PATH [--column NAME ...] [--delimiter CHAR]` — runs the
  tool.

## Conventions and Constraints

- Errors are written to standard error with a `csvsum:` prefix.

## Testing and Verification Baseline

- `tests/test_summary.py` covers all-column and selected-column summaries, an
  unknown column, and a semicolon delimiter. `tests/test_cli.py` covers the
  output line, a missing file, and an unknown column.

## Relevant Existing Behavior

- Without `--column`, every header column is summarized in header order.
  `--column` is repeatable and keeps the given order.
- Cells are stripped and parsed with `float`; blank or unparsable cells are
  skipped. A column with no numeric cells prints `NAME: no numeric values`.
- Output line: `NAME: count=N min=MIN max=MAX mean=MEAN`, with min and max in
  Python `g` format and the mean to two decimal places.
- Missing file: `csvsum: no such file: PATH` on standard error, exit status 2.
  Unknown column: `csvsum: unknown column: NAME` on standard error, exit status
  2. Argument errors from argparse exit with status 2. Success exits 0.

## Evidence

- `csvsum/cli.py`, `csvsum/summary.py` — behavior above.
- `python3 -m pytest -q` — 7 passed.
- `python3 -m csvsum examples/orders.csv` — four summary lines, exit 0.

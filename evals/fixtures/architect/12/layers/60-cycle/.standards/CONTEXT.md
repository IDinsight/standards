# Project Context

## Project Baseline

- `tally` is a small Python command-line tool that summarizes one numeric
  column of a CSV file, optionally per group. Version 0.4.1 (`tally/__init__.py`,
  `pyproject.toml`).
- The repository has no user guide. `README.md` holds one usage example and the
  test command.

## Stack and Tooling

- Python 3.10+ standard library only (`argparse`, `csv`, `json`); no third-party
  runtime dependencies.
- pytest for tests.

## Structure and Boundaries

- `tally/cli.py` — argument parser, input opening, error reporting, and output
  rendering; the command-line contract is defined here.
- `tally/summary.py` — CSV reading, column validation, numeric parsing, and the
  statistics; raises `DataError` for input problems.
- `tally/__main__.py` — `python3 -m tally` entry point. `pyproject.toml` also
  declares a `tally` console script.
- `examples/sales.csv` — small sample input used by the tests.
- `tests/test_cli.py` — command behavior tests.

## Commands

- `python3 -m tally --help` — prints the current usage and options; runs offline
  from the repository root.
- `python3 -m pytest` — runs the test suite from the repository root.

## Conventions and Constraints

- Usage errors are reported by argparse; input and data errors are printed by
  `tally/cli.py` with a `tally: error:` prefix. The two kinds exit with
  different statuses (see `tally/cli.py`).
- No documentation generation tooling is configured; Markdown files are written
  by hand.

## Testing and Verification Baseline

- `tests/test_cli.py` covers the default sum, grouping, the three output
  formats, precision, and the main error paths. All tests pass on the committed
  tree.

## Relevant Existing Behavior

- Blank cells in the summarized column are skipped; a group with no numeric
  values is left out of the output.
- Results are printed sorted by group value.

## Evidence

- `tally/cli.py`, `tally/summary.py` — read in full.
- `python3 -m tally --help` and `python3 -m pytest` — run from the repository
  root on the committed tree.

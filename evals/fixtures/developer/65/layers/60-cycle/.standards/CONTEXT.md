# Project Context

## Project Baseline

- `inventory` is a small Python command-line tool that summarizes stock levels
  from a CSV export (columns `sku,name,quantity,reorder_level`).

## Stack and Tooling

- Python 3.10+ standard library only; pytest for tests. No packaging or install
  step: run from the repository root.

## Structure and Boundaries

- `inventory/models.py` — `Item` dataclass; `is_low` is true when
  `quantity <= reorder_level`.
- `inventory/store.py` — `load_items(path)` reads the CSV into `Item` objects.
- `inventory/report.py` — `build_summary(items)` returns a dict with
  `total_items`, `total_units`, and `low_stock` (SKUs in input order);
  `format_text(summary)` renders it for people.
- `inventory/cli.py` — argparse entry point with a single `summary <path>`
  subcommand; `main(argv)` returns an exit code. `inventory/__main__.py` runs it.

## Commands

- `python3 -m pytest -q` — run the test suite from the repository root.
- `python3 -m inventory summary samples/stock.csv` — print a summary of the
  sample file.

## Conventions and Constraints

- Formatting helpers in `report.py` return strings; only `cli.py` prints.
- Argument errors are left to argparse (exit status 2 with a usage message).

## Testing and Verification Baseline

- `tests/test_report.py` covers `build_summary` and `format_text`;
  `tests/test_cli.py` covers the text output of `summary` through `main`. All
  pass on the current tree.

## Relevant Existing Behavior

- Text output is three lines: `Items: N`, `Units: N`, and
  `Low stock: <comma-separated SKUs>` or `Low stock: none`.

## Evidence

- `inventory/`, `tests/`, `README.md`; `python3 -m pytest -q` (4 passed).

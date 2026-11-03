# Project Context

## Project Baseline

- `inventory` is a small command-line tool that reads stock levels from a CSV
  file and prints summaries. It currently has one subcommand, `summary`.

## Stack and Tooling

- Python 3 standard library only (`csv`, `argparse`, `dataclasses`,
  `pathlib`); pytest for tests. No formatter, linter, or type checker is
  configured in the repository.

## Structure and Boundaries

- `inventory/stock.py` — the `Item` dataclass, CSV loading (`load_items`), and
  stock calculations (`total_units`).
- `inventory/cli.py` — argparse entry point; each subcommand loads items and
  prints plain-text output.
- `tests/test_stock.py` — pytest tests for loading, calculations, and the
  `summary` command.

## Commands

- `python3 -m pytest -q` — runs the test suite from the project root.
- `python3 -m inventory.cli summary <csv>` — prints item and unit counts.

## Conventions and Constraints

- CSV columns are `sku,name,quantity,reorder_level`; quantities are integers.
- Calculations live in `stock.py`; `cli.py` only parses arguments and prints.

## Testing and Verification Baseline

- All three existing tests pass with `python3 -m pytest -q`.

## Evidence

- `inventory/stock.py`, `inventory/cli.py`, `tests/test_stock.py` — structure
  and behavior above.
- `python3 -m pytest -q` — 3 passed.

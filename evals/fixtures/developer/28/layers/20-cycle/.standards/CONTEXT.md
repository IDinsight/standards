# Project Context

## Project Baseline

- `stockroom` is a small command-line tool that tracks stock levels for items
  identified by SKU, stored in a JSON file.

## Stack and Tooling

- Python 3 standard library only (`argparse`, `json`, `dataclasses`,
  `pathlib`); no third-party runtime dependencies.
- pytest for tests.

## Structure and Boundaries

- `stockroom/models.py` — `Item` dataclass (`sku`, `name`, `on_hand`).
- `stockroom/inventory.py` — `Inventory`: in-memory items keyed by SKU, JSON
  `load`/`save`, `get`, `all` (sorted by SKU), and `adjust` with validation.
- `stockroom/__main__.py` — argparse CLI with `--data` (default `stock.json`)
  and the `list` and `adjust` subcommands; output is tab-separated.
- `tests/test_inventory.py` — unit and CLI tests.

## Commands

- `python3 -m pytest` — run the test suite from the project root.
- `python3 -m stockroom --data <file> list` — print every item.

## Conventions and Constraints

- Validation lives in `Inventory` and raises `ValueError`; the item is left
  unchanged on rejection.
- CLI output is one tab-separated line per item, ordered by SKU.
- The JSON file has a top-level `items` list of objects.

## Testing and Verification Baseline

- All tests in `tests/test_inventory.py` pass with `python3 -m pytest`.
- CLI tests call `main(argv)` directly with a temporary data file and capture
  stdout.

## Evidence

- `stockroom/` and `tests/` at the current commit; `python3 -m pytest`.

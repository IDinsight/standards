# Project Context

## Project Baseline

- `inventory` is a small in-memory stock-tracking package used by internal
  warehouse tools. There is no persistence, network, or CLI layer.

## Stack and Tooling

- Python 3, standard library only. Tests use pytest; `pytest.ini` sets
  `testpaths = tests`.

## Structure and Boundaries

- `inventory/models.py` — the `Item` dataclass (`sku`, `name`, `quantity`).
- `inventory/store.py` — `InventoryStore`, the only owner of item state:
  `add`, `get`, `adjust`, and `items()` (all items sorted by SKU).
- `inventory/report.py` — read-only report functions that take a store and
  return plain Python values (`stock_summary` returns a dict).
- `tests/` — pytest modules per source module.

## Commands

- `python3 -m pytest` — run the full test suite from the project root.

## Conventions and Constraints

- Invalid input raises `ValueError` and leaves store state unchanged.
- Reports read items through `InventoryStore.items()` and never mutate the
  store or reach into `_items`.
- Module-private helpers use a leading underscore; no type-checking tooling is
  configured.

## Testing and Verification Baseline

- 5 tests in `tests/test_store.py` and `tests/test_report.py`; all pass.

## Relevant Existing Behavior

- `InventoryStore.add(sku, name, quantity=0)` replaces an existing item with
  the same SKU.
- `stock_summary(store)` returns `{"skus": <count>, "units": <total>}`.

## Evidence

- `inventory/store.py`, `inventory/report.py` — store and report behavior.
- `python3 -m pytest` — 5 passed.

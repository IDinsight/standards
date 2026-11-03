<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: low-stock-report-20260924T090000Z-3c8e1f5a
-->

# Technical Design

## Context

`stockroom` keeps items in a JSON file through `Inventory`
(`stockroom/inventory.py`) and exposes an argparse CLI in
`stockroom/__main__.py`. Validation already lives in `Inventory` and raises
`ValueError`.

## Decision

Add an optional `reorder_level` to `Item`, persist it as an optional JSON key,
put the report selection in a new pure module `stockroom/reports.py`, and add
a `low-stock` subcommand that formats the report. Keeping selection separate
from output lets the CLI stay a thin formatter.

## Acceptance Coverage

- `AC-001`: `Item.reorder_level: int | None = None`; JSON key
  `reorder_level` is written only when set and read as `None` when absent;
  `low_stock` skips items whose level is `None`.
- `AC-002`: `reports.low_stock(inventory)` selects items with
  `on_hand <= reorder_level`, ordered by SKU via `Inventory.all()`.
- `AC-003`: `low-stock` subcommand in `stockroom/__main__.py` prints
  `sku`, `name`, `on_hand`, `reorder_level` separated by tabs.
- `AC-004`: `Inventory.set_reorder_level(sku, level)` raises `ValueError`
  for a negative level before changing the item.

## Components

- `stockroom/models.py` — `Item` gains `reorder_level`.
- `stockroom/inventory.py` — load/save the optional key; new
  `set_reorder_level(sku, level)`.
- `stockroom/reports.py` (new) — `low_stock(inventory) -> list[Item]`, no I/O.
- `stockroom/__main__.py` — `low-stock` subcommand.

## Interfaces and Contracts

- JSON item object: `{"sku", "name", "on_hand"}` plus optional integer
  `reorder_level`. Files without the key load unchanged.
- `Inventory.set_reorder_level(sku: str, level: int | None) -> Item`; `None`
  clears the level; a negative integer raises `ValueError` naming the SKU and
  value.
- CLI: `python3 -m stockroom [--data FILE] low-stock`; exit 0; one line per
  reported item, `SKU<TAB>name<TAB>on_hand<TAB>reorder_level`; no output when
  nothing is low.

## Technical Acceptance Criteria

- `AC-001`: Saving an inventory whose items have no reorder level produces the
  same JSON as before this change.
- `AC-004`: A rejected `set_reorder_level` leaves the stored level unchanged.

## Build Plan

1. Model and persistence of `reorder_level`, with validation in `Inventory`.
2. Report selection in `stockroom/reports.py`.
3. CLI subcommand.

## Risks and Follow-up

- No CLI command sets reorder levels in this cycle; levels are set through
  `Inventory.set_reorder_level` or by editing the data file.

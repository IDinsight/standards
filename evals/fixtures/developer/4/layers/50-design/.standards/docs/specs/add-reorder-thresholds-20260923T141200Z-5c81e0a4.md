<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: add-reorder-thresholds-20260923T141200Z-5c81e0a4
-->

# Technical Design

## Context

`InventoryStore` owns all item state; report functions in `inventory/report.py`
are read-only and return plain Python values. Invalid input raises
`ValueError` before any state changes (see `.standards/CONTEXT.md`).

## Decision

Store the threshold on `Item` itself, validated by the store, and add a
read-only `low_stock` report beside `stock_summary`. No new modules are
needed.

## Acceptance Coverage

- `AC-001`: `Item.reorder_threshold: Optional[int] = None`;
  `InventoryStore.add(..., reorder_threshold=None)` and
  `InventoryStore.set_threshold(sku, threshold)`.
- `AC-002`: one validation helper in `inventory/store.py`, called by both
  `add` and `set_threshold` before any mutation, raising `ValueError`.
- `AC-003`, `AC-004`: `low_stock(store)` in `inventory/report.py`.

## Components

- `inventory/models.py` — `Item` gains `reorder_threshold`.
- `inventory/store.py` — threshold validation and `set_threshold`.
- `inventory/report.py` — `low_stock(store)`.

## Interfaces and Contracts

- `InventoryStore.set_threshold(sku, threshold)`: `threshold` is a
  non-negative `int` or `None` (clears it); returns the item.
- `low_stock(store) -> list[dict]`: each entry is
  `{"sku": str, "name": str, "quantity": int, "reorder_threshold": int}`.
  It includes an item exactly when `reorder_threshold is not None` and
  `quantity <= reorder_threshold`, ordered by SKU ascending, and returns an
  empty list when nothing matches. It reads items only through
  `InventoryStore.items()` and does not mutate the store.

## Technical Acceptance Criteria

- `AC-003`: the comparison is inclusive (`<=`); a threshold of 0 matches only
  items whose quantity is 0.
- `AC-004`: a `None` threshold excludes the item; it is not treated as 0.

## Build Plan

1. Threshold on the model and store, with validation.
2. `low_stock` report over the store.

## Risks and Follow-up

- `stock_summary` output is unchanged; callers comparing whole `Item` objects
  see the new field with default `None`.

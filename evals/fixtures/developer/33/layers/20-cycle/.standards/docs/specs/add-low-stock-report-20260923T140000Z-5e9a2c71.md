<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: add-low-stock-report-20260923T140000Z-5e9a2c71
-->

# Technical Design

## Context

`src/inventory.js` loads and normalizes items and formats the table used by
`list`; `src/cli.js` dispatches commands through `run(argv, out)` and returns
the exit status.

## Decision

Add a pure selection function in a new module, `src/report.js`, and a thin
`low-stock` command in the existing CLI that reuses the current loader and table
formatter. No new dependencies.

## Acceptance Coverage

- `AC-001`: `lowStock(items, threshold)` in `src/report.js`.
- `AC-002`: `low-stock` command in `src/cli.js` using `loadInventory`,
  `lowStock`, and `formatTable`.

## Interfaces and Contracts

- `lowStock(items, threshold)`: takes normalized inventory items; returns a new
  array sorted by quantity ascending, ties by `sku` (`localeCompare`); throws
  `RangeError` when `threshold` is not a non-negative integer; does not mutate
  its input.
- CLI: `low-stock FILE --threshold N`; `N` is parsed as a base-10 integer;
  a missing or invalid value prints the usage text and returns 2; success writes
  `formatTable(result)` plus a newline and returns 0.

## Technical Acceptance Criteria

- `AC-001`: strict less-than comparison against the threshold.
- `AC-002`: the usage text lists both `list` and `low-stock`.

## Build Plan

1. Selection module.
2. CLI command and usage text.

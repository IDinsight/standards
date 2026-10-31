<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: category-reorder-thresholds-20260924T090000Z-5b81e3c4
-->

# Technical Design

## Context

Low-stock selection lives in `src/stock.js` (`lowStock`, `DEFAULT_THRESHOLD =
5`); `src/report.js` formats rows and `src/cli.js` reads the inventory file.
See `.standards/CONTEXT.md`. No project references apply.

## Decision

- Thresholds are an optional JSON object keyed by category name. The CLI takes
  its path as a second argument; the project keeps its values in
  `config/thresholds.json`.
- `lowStock(items, thresholds = {})` replaces the numeric parameter. A helper
  `thresholdFor(item, thresholds)` returns the configured value when the
  category has an entry, including 0, and `DEFAULT_THRESHOLD` otherwise.
  Absence is decided with a nullish check, so a configured 0 is a real
  threshold.
- `formatReport(items, thresholds = {})` passes the map through. Columns, row
  format, and row order are unchanged.

## Acceptance Coverage

- `AC-001`: `thresholdFor` returns the configured category value; `lowStock`
  keeps the inclusive comparison.
- `AC-002`: `thresholdFor` falls back to `DEFAULT_THRESHOLD` (5) when the
  category has no entry.
- `AC-003`: the nullish presence check keeps a configured 0 as the threshold.

## Interfaces and Contracts

- CLI: `node src/cli.js <inventory.json> [thresholds.json]`. Without the second
  argument the map is empty and every item uses the default.
- Threshold map: `{ "<category>": <integer, 0 or greater> }`.

## Technical Acceptance Criteria

- `AC-001`, `AC-002`: an item is listed exactly when
  `quantity <= thresholdFor(item, thresholds)`.
- `AC-003`: `thresholdFor` returns 0 for a category configured as 0.

## Build Plan

1. MODIFY `src/stock.js`: add `thresholdFor`, change `lowStock` to take the
   map.
2. MODIFY `src/report.js` and `src/cli.js`: pass the map from the optional
   thresholds file through to `lowStock`.
3. CREATE `config/thresholds.json` with the values from the warehouse lead.

## Risks and Follow-up

- Malformed threshold files surface as a JSON parse error from the CLI; no
  extra validation is planned.

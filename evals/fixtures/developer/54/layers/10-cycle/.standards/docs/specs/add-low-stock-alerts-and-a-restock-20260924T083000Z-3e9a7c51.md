<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: add-low-stock-alerts-and-a-restock-20260924T083000Z-3e9a7c51
-->

# Technical Design

## Context

`stockroom` keeps items as plain objects `{ sku, name, quantity, reorderLevel }`
produced by `loadItems` in `src/inventory.js`; every helper is a pure function
over an array of them (see `.standards/CONTEXT.md`). The scope adds low-stock
detection and a CSV restock report on top of that shape.

## Decision

Add two pure modules beside `src/inventory.js`: `src/alerts.js` for detection
and `src/report.js` for the CSV. The report reuses the detection function so
both always agree on which items are low. No new dependencies; CSV quoting is
written in the module.

## Acceptance Coverage

- `AC-001`: `lowStock(items)` in `src/alerts.js` (contract below).
- `AC-002`: `restockReport(items)` in `src/report.js`, built on `lowStock`.

## Interfaces and Contracts

- `lowStock(items)`: returns a new array containing the input item objects with
  `reorderLevel > 0` and `quantity <= reorderLevel`, sorted by `sku` ascending
  using plain string comparison (`<` and `>`), not locale comparison. The input
  array and its items are not modified.
- `restockReport(items)`: returns a string. First line
  `sku,name,quantity,order_quantity`; then one line per entry of
  `lowStock(items)`, in the same order, with
  `order_quantity = 2 * reorderLevel - quantity`. Every line ends with `\n`,
  including the last. A field containing a comma, double quote, or newline is
  wrapped in double quotes with embedded quotes doubled (RFC 4180). With no
  low-stock items the result is the header line alone.

## Technical Acceptance Criteria

- `AC-001`: `lowStock` includes an item exactly at its reorder level, excludes
  items with `reorderLevel` 0, and returns SKUs in ascending string order.
- `AC-002`: `restockReport` output parses as RFC 4180 CSV with the fixed header
  and one row per `lowStock` entry carrying the stated order quantity.

## Build Plan

1. `src/alerts.js` with `lowStock`.
2. `src/report.js` with `restockReport`, depending on step 1.

## Risks and Follow-up

- The `test` script lists test files explicitly; new test files must be added
  to it to run under `npm test`.

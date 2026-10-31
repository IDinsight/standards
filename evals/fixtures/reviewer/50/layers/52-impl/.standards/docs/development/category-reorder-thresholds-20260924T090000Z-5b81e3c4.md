<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: category-reorder-thresholds-20260924T090000Z-5b81e3c4
-->

# Development Plan

`Cycle`: `category-reorder-thresholds-20260924T090000Z-5b81e3c4` `Mode`:
`AUTONOMOUS` `User Style`: `NONE` `User Style Locked`: `true` `Status`:
`COMPLETE` `Verification Cadence`: `AFTER_IMPLEMENTATION` `Current Increment`:
`NONE`

## Implementation Contract

- `Scope`:
  `.standards/docs/scope/category-reorder-thresholds-20260924T090000Z-5b81e3c4.md`
- `Architecture`:
  `.standards/docs/specs/category-reorder-thresholds-20260924T090000Z-5b81e3c4.md`
- `Request`: `Add per-category reorder thresholds to the low-stock report.`

## Build Steps

### DEV-001 — Per-category threshold lookup in lowStock

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `AC-001, AC-002, AC-003`

**Goal**

`lowStock` compares each item with its category's configured threshold, or the
default of 5 when the category has none.

**Affected Area**

`src/stock.js` (`thresholdFor`, `lowStock`).

**Expected Outcome**

`lowStock(items, thresholds)` keeps an item exactly when its quantity is at or
below `thresholdFor(item, thresholds)`; a configured 0 is used as 0. Calls
without a map behave as before.

**Self-Check**

`npm test` in the project root on the DEV-001 working tree (existing tests
only): exit 0, 3 passing. `node -e` with `lowStock` on a two-item `samples`
inventory and `{ samples: 0 }` returned only the item with quantity 0.

### DEV-002 — Thresholds file in the report and CLI

`Status`: `DONE` `Depends On`: `DEV-001` `Acceptance`: `AC-001, AC-002`

**Goal**

The report and CLI pass a thresholds map from an optional file.

**Affected Area**

`src/report.js`, `src/cli.js`, `config/thresholds.json`.

**Expected Outcome**

`node src/cli.js <inventory.json> [thresholds.json]` prints the report using the
file's thresholds; without the second argument every item uses the default.

**Self-Check**

`node src/cli.js data/inventory.sample.json config/thresholds.json` in the
project root: exit 0, rows A-1, A-2, S-1. `node src/cli.js
data/inventory.sample.json`: exit 0, rows A-1, P-1, S-1, S-2. `npm test`:
exit 0, 3 passing.

## Plan Notes

Plan approved by the user before implementation; user style `NONE` locked at
approval. Project references loaded: NONE.

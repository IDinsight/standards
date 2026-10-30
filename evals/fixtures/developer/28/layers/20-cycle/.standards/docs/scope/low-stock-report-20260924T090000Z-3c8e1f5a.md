<!-- STANDARDS
Artifact: SCOPE
Cycle: low-stock-report-20260924T090000Z-3c8e1f5a
-->

# Low-Stock Report

## Goal

Let the stockroom operator see which items need reordering without scanning
the full list, by giving items an optional reorder level and reporting the
items at or below it.

## Constraints

- Existing data files without reorder levels keep loading and behaving as
  before.
- No new third-party dependencies.

## Non-goals

- Automatic purchase orders or supplier integration.
- Changing the output of the existing `list` and `adjust` commands.

## Work

### 1. Reorder levels

**Intent:** Each item needs a threshold that marks it as running low.

**Done when:**

- `AC-001`: An item can have an optional reorder level, a non-negative
  integer; an item without one never appears in the low-stock report.
- `AC-004`: Setting a negative reorder level is rejected with an error and
  the item is unchanged.

**Depends on:** None

### 2. Low-stock report

**Intent:** The operator can list everything that needs reordering.

**Done when:**

- `AC-002`: The low-stock report lists every item whose on-hand quantity is
  at or below its reorder level, ordered by SKU.
- `AC-003`: `python3 -m stockroom low-stock` prints the report as one
  tab-separated line per item: SKU, name, on-hand quantity, reorder level.

**Depends on:** Work item 1.

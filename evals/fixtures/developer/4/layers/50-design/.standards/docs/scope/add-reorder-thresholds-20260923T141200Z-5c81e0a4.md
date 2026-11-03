<!-- STANDARDS
Artifact: SCOPE
Cycle: add-reorder-thresholds-20260923T141200Z-5c81e0a4
-->

# Reorder Thresholds

## Goal

Warehouse staff need to know which items are running low before they run out.
Each item may carry its own reorder threshold, and a report lists the items
that have reached it.

## Constraints

- Existing callers that add, adjust, or summarize items keep working without
  changes.

## Non-goals

- Automatic purchase orders, notifications, or reorder quantities.
- Persisting inventory or thresholds beyond the in-memory store.

## Work

### 1. Per-item reorder threshold

**Intent:** Let staff record the stock level at which an item should be
reordered.

**Done when:**

- `AC-001`: An item can be given an optional reorder threshold (a non-negative
  whole number), either when it is added or later; items without a threshold
  behave as before.
- `AC-002`: Setting a negative reorder threshold is rejected with an error and
  leaves the item's existing threshold unchanged.

**Depends on:** None

### 2. Low-stock report

**Intent:** Give staff one list of what needs reordering.

**Done when:**

- `AC-003`: A low-stock report lists every item whose quantity is at or below
  its reorder threshold, ordered by SKU, showing SKU, name, quantity, and
  threshold.
- `AC-004`: Items without a reorder threshold never appear in the low-stock
  report.

**Depends on:** Work item 1

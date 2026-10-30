<!-- STANDARDS
Artifact: SCOPE
Cycle: add-low-stock-report-20260923T140000Z-5e9a2c71
-->

# Low-Stock Report

## Goal

Warehouse staff need to see which items are running low without scanning the
full `list` output, so they can reorder in time.

## Constraints

- The existing `list` command and the inventory file format stay unchanged.
- No new runtime dependencies.

## Non-goals

- Reordering, supplier data, or per-item thresholds.

## Work

### 1. Low-stock report

**Intent:** Let staff list the items below a stock threshold they choose.

**Done when:**

- `AC-001`: Given a threshold, the report includes exactly the items whose
  quantity is below it, lowest quantity first, with equal quantities ordered by
  SKU.
- `AC-002`: `stock low-stock` with an inventory file and `--threshold N` prints
  the report in the same table format as `list`; a missing, non-integer, or
  negative threshold prints usage and exits with status 2.

**Depends on:** None

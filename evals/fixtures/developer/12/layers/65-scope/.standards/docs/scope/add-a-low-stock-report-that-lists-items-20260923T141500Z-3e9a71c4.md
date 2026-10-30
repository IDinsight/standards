<!-- STANDARDS
Artifact: SCOPE
Cycle: add-a-low-stock-report-that-lists-items-20260923T141500Z-3e9a71c4
-->

# Low-Stock Report

## Goal

Let people running the storeroom see at a glance which items need to be
reordered, using the reorder levels they already set on items.

## Constraints

- Uses the existing per-item reorder level; items keep working unchanged when
  no level is set.
- Existing commands and the data file format keep their current behavior.

## Non-goals

- Notifications, email, or scheduled reports.
- Automatic purchase orders or supplier integration.
- Changing how reorder levels are set.

## Work

### 1. Low-stock report command

**Intent:** Give a single command that answers "what do we need to reorder?"

**Done when:**

- `AC-001`: A low-stock report lists every item whose quantity is at or below
  its reorder level, showing its SKU, name, quantity, and reorder level.
- `AC-002`: Items with no reorder level never appear in the report.
- `AC-003`: When no item is at or below its reorder level, the report says so
  and the command exits successfully.

**Depends on:** None

## Assumptions

- The report is read by people at a terminal; plain text output is enough.

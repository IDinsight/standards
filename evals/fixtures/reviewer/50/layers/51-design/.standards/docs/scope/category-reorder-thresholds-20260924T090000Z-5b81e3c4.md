<!-- STANDARDS
Artifact: SCOPE
Cycle: category-reorder-thresholds-20260924T090000Z-5b81e3c4
-->

# Category Reorder Thresholds

## Goal

The low-stock report flags every item against one reorder level of 5. Cables
move fast and are flagged too late; displays and material samples move slowly
and are flagged too early. The report must apply a reorder threshold per
category, while categories nobody has configured keep the current level.

## Constraints

- `node src/cli.js <inventory.json>` keeps working when no thresholds are
  configured.
- Thresholds are whole numbers of units, 0 or greater.

## Non-goals

- Changing the report's columns or row format.
- Editing thresholds from the CLI or any other interface.
- Updating the README or other project documentation.

## Work

### 1. Per-category thresholds in the low-stock report

**Intent:** Let warehouse staff tune when each category appears in the report.

**Done when:**

- `AC-001`: When a category has a configured reorder threshold, the report
  lists that category's items whose quantity is at or below that threshold.
- `AC-002`: Items in a category with no configured threshold are listed when
  their quantity is at or below the default threshold of 5.
- `AC-003`: A configured threshold of 0 is honoured: that category's items are
  listed only when their quantity is 0.

**Depends on:** None

## Assumptions

- The warehouse lead supplies the initial threshold values.

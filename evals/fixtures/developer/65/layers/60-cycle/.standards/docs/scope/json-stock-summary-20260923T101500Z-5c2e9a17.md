<!-- STANDARDS
Artifact: SCOPE
Cycle: json-stock-summary-20260923T101500Z-5c2e9a17
-->

# JSON Stock Summary

## Goal

Let scripts consume the stock summary without parsing the human-readable text,
by offering the same summary as JSON from the existing `summary` command.

## Constraints

- Existing text output and its default use must keep working unchanged.
- No new third-party dependencies.

## Non-goals

- JSON input files or changes to the CSV format.
- New summary fields or changes to how low stock is determined.
- Output formats other than text and JSON.

## Work

### 1. JSON output for the summary command

**Intent:** Scripts and dashboards can read stock totals and low-stock SKUs
directly.

**Done when:**

- `AC-001`: `inventory summary <file> --format json` prints the summary as one
  JSON object with the keys `total_items`, `total_units`, and `low_stock`, where
  `low_stock` lists the low-stock SKUs.
- `AC-002`: Running `inventory summary <file>` without `--format`, or with
  `--format text`, prints the same output as before this change.
- `AC-003`: An unsupported `--format` value is rejected with exit status 2 and a
  usage error, and no summary is printed.

**Depends on:** None

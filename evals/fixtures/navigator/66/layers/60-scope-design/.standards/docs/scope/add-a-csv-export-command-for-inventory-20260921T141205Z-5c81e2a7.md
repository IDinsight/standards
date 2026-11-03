<!-- STANDARDS
Artifact: SCOPE
Cycle: add-a-csv-export-command-for-inventory-20260921T141205Z-5c81e2a7
-->

# CSV Export for Stockroom

## Goal

Let warehouse staff open the inventory in a spreadsheet without copying the
`list` output by hand, and let them find out how to do it.

## Constraints

- The existing `list` and `low` commands and their output stay unchanged.
- No new runtime dependencies; the tool runs on plain Node.js.

## Non-goals

- Export formats other than CSV.
- Writing the export to a file chosen by the tool; output goes to standard
  output.
- Importing CSV.

## Work

### 1. Export command

**Intent:** Produce inventory data in a form spreadsheets open directly.

**Done when:**

- `AC-001`: `stockroom export <file>` writes every item as CSV to standard
  output, starting with a `sku,name,quantity` header row.
- `AC-002`: Fields containing commas, double quotes, or line breaks are quoted
  as RFC 4180 requires, with embedded double quotes doubled.
- `AC-003`: `stockroom export <file> --below <n>` exports only items whose
  quantity is below `n`, matching the existing `low` command.

**Depends on:** None

### 2. Usage documentation

**Intent:** The project has no README; staff need a place to learn how to run
the export.

**Done when:**

- `AC-004`: A README at the repository root explains how to run
  `stockroom export`, its `--below` option, and the output columns.

**Depends on:** Work item 1.

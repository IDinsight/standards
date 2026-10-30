<!-- STANDARDS
Artifact: SCOPE
Cycle: let-administrators-export-records-as-csv-20260921T141200Z-5b8e2f17
-->

# CSV Export of Records

## Goal

Administrators need to take record data into spreadsheets for monthly
reporting. Today the only way to get records out is paging through
`GET /records` 50 at a time and copying the JSON by hand. Administrators should
be able to download the records they need as a single CSV file.

## Constraints

- Export is limited to administrators, matching the existing rule for creating
  records.
- The existing `GET /records` listing and its response shape do not change.

## Non-goals

- Scheduled or emailed exports.
- Formats other than CSV.
- Choosing which fields appear in the export.

## Work

### 1. Download records as CSV

**Intent:** Give administrators a file they can open directly in a
spreadsheet program without manual cleanup.

**Done when:**

- `AC-001`: An administrator can download all records, or only the records
  with a given status, as a CSV file.
- `AC-002`: The CSV file starts with a header row, and fields containing
  commas, double quotes, or line breaks are quoted as RFC 4180 describes.
- `AC-003`: A signed-in user who is not an administrator receives status 403
  and no record data.

**Depends on:** None

### 2. Explain the export to administrators

**Intent:** Administrators learn about the export from the guide they already
use.

**Done when:**

- `AC-004`: The admin guide explains how to export records as CSV, including
  the status filter.

**Depends on:** 1

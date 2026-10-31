<!-- STANDARDS
Artifact: SCOPE
Cycle: records-csv-export-20260923T141200Z-5c81e0a4
-->

# Records CSV Export

## Goal

Administrators need a complete copy of the records list in a spreadsheet-ready
file for periodic reconciliation. Today records can only be read as JSON through
`GET /records`.

## Constraints

- Use the existing role and permission model in `config/access.json`.
- No new runtime dependencies.

## Non-goals

- Filtering, column selection, or scheduled exports.
- Export access for any role other than administrators.
- User guides or other project documentation for the export.

## Work

### 1. Administrator records export

**Intent:** Give administrators a one-step download of every record.

**Done when:**

- `AC-001`: An administrator can download every record as a CSV file from the
  admin area, with a header row followed by one line per record.
- `AC-002`: Field values that contain commas, double quotes, or line breaks are
  escaped per RFC 4180, so the file opens with the original values intact.
- `AC-003`: A signed-in user without the administrator role, or a request with
  no user, receives status 403 and no record data.

**Depends on:** None

## Assumptions

- The current record volume fits comfortably in a single in-memory export.

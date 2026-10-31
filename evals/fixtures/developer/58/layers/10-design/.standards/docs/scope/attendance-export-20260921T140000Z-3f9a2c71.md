<!-- STANDARDS
Artifact: SCOPE
Cycle: attendance-export-20260921T140000Z-3f9a2c71
-->

# Attendance CSV Export

## Goal

Site coordinators need attendance records as a CSV file they can open in a
spreadsheet, limited to the dates and the site they are reporting on.

## Constraints

- Use the existing CSV quoting in `src/csv.js`.
- No new runtime dependencies.

## Non-goals

- No export screen, command, or HTTP route; the export is a library function.
- No change to how sheet rows are parsed.

## Work

### 1. CSV export

**Intent:** Give coordinators every attendance record in a spreadsheet-ready
format.

**Done when:**

- `AC-001`: Exporting returns CSV text with the header row
  `date,site,participant,present,notes` followed by one row per record, with
  fields quoted by the existing CSV rules.

**Depends on:** None

### 2. Filters

**Intent:** Let coordinators export only the period and site they report on.

**Done when:**

- `AC-002`: An optional `from`/`to` date range (inclusive, ISO `YYYY-MM-DD`)
  limits the export to records dated within the range.
- `AC-003`: An optional site name limits the export to records from that site;
  site names match exactly after trimming.

**Depends on:** Work item 1.

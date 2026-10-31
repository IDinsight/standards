<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: attendance-export-20260921T140000Z-3f9a2c71
-->

# Technical Design

## Context

The scope asks for a CSV export of attendance records with optional date-range
and site filters. Records come from `parseRecords` in `src/records.js` with ISO
`YYYY-MM-DD` dates and trimmed site names. `src/csv.js` already provides RFC
4180 quoting (see `.standards/CONTEXT.md`).

## Decision

Add a pure function `exportAttendance(records, options)` in a new
`src/export.js`. It filters in memory, then writes lines with `csvLine`. Dates
are compared as ISO strings, which sort chronologically. No new dependencies.

## Acceptance Coverage

- `AC-001`: `exportAttendance` writes the fixed header and one line per selected
  record through `csvLine`.
- `AC-002`: `options.from` and `options.to` filter by inclusive string
  comparison on `record.date`.
- `AC-003`: `options.site` filters by exact equality with `record.site` after
  trimming the option value.

## Interfaces and Contracts

- `exportAttendance(records, { from, to, site } = {})` returns a string. Every
  option is optional; an omitted option does not filter.
- Columns, in order: `date`, `site`, `participant`, `present`, `notes`.
  `present` is written as `yes` or `no`; missing notes are empty cells.
- Lines end with CRLF, including the last line.

## Technical Acceptance Criteria

- `AC-001`: The header line is exactly `date,site,participant,present,notes`;
  every field passes through `csvCell`.
- `AC-002`: A record dated equal to `from` or `to` is included; a record outside
  the range is excluded.
- `AC-003`: Site matching is case-sensitive and exact after trimming the
  requested site.

## Build Plan

1. CREATE `src/export.js` with the unfiltered export.
2. MODIFY `src/export.js` to add the date-range filter.
3. MODIFY `src/export.js` to add the site filter.

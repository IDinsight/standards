<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: add-a-since-date-filter-to-the-export-20260922T141500Z-5c1e9a3b
-->

# Technical Design

## Context

`src/export.js` turns the item list into CSV through `formatCsv` in
`src/csv.js`; `src/cli.js` parses arguments and maps usage errors to exit
status 2. Items carry `updatedAt` as ISO 8601 UTC strings written by the import
command (see `.standards/CONTEXT.md`).

## Decision

Add `parseSince` to `src/export.js`: it accepts only `YYYY-MM-DD` and returns
the epoch milliseconds of 00:00:00Z on that date, or null. The CLI parses
`--since` before loading the stock list, rejects a null result, and passes the
boundary to `exportItems` as an optional `since` filter compared with
`Date.parse(item.updatedAt)`. Keeping the comparison in epoch milliseconds
avoids any dependence on the process time zone.

## Acceptance Coverage

- `AC-001`: `parseSince` returns UTC midnight; `exportItems` keeps items with
  `Date.parse(updatedAt) >= since`; `COLUMNS` and the header are unchanged.
- `AC-002`: `src/cli.js` maps a null `parseSince` result to a stderr message
  and exit 2 before any output is written.
- `AC-003`: `since` defaults to null, which bypasses filtering.
- `AC-004`: No architectural impact — the guide update belongs to the
  documentation phase.

## Interfaces and Contracts

- `parseSince(value: string): number | null`
- `exportItems(items, { since = null } = {}): string`
- CLI: `stockroom export --since YYYY-MM-DD`; an invalid value prints
  `invalid --since date: <value> (expected YYYY-MM-DD)` to stderr and exits 2.

## Technical Acceptance Criteria

- `AC-001`: The boundary is inclusive at 00:00:00Z of the given date,
  regardless of the process time zone.
- `AC-002`: No CSV bytes are written to stdout for an invalid value.

## Build Plan

1. MODIFY `src/export.js`: add `parseSince` and the optional `since` filter.
2. MODIFY `src/cli.js`: parse and validate `--since` for the export command.

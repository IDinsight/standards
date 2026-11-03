<!-- STANDARDS
Artifact: SCOPE
Cycle: add-a-since-date-filter-to-the-export-20260922T141500Z-5c1e9a3b
-->

# Export --since Filter

## Goal

Let operators export only the items that changed on or after a given date, so
they can pass recent stock changes to other systems without exporting the whole
list.

## Constraints

- The date is a calendar date interpreted in UTC; item timestamps are stored as
  ISO 8601 UTC.
- Export output without the new option must not change.

## Non-goals

- Changes to the import command.
- Time-of-day or time-zone arguments.

## Work

### 1. Date-filtered export

**Intent:** Operators can limit an export to recently updated items.

**Done when:**

- `AC-001`: `stockroom export --since YYYY-MM-DD` outputs, with the same header
  and columns, only items whose `updatedAt` is at or after 00:00:00 UTC on that
  date.
- `AC-002`: A `--since` value that is not a `YYYY-MM-DD` date exits with status
  2, prints an error to standard error, and writes no CSV.
- `AC-003`: `stockroom export` without `--since` produces the same output as
  before this change.

**Depends on:** None

### 2. Export guide

**Intent:** Operators can find and use the new option.

**Done when:**

- `AC-004`: `docs/export.md` explains `--since`, its UTC-day boundary, and the
  invalid-date error.

**Depends on:** 1

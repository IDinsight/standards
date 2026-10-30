<!-- STANDARDS
Artifact: SCOPE
Cycle: make-the-category-report-fast-for-large-20260923T141000Z-5c8e2a14
-->

# Faster Category Report

## Goal

Keep the category report responsive as ledgers grow to around 100,000 entries,
without giving up correct totals.

## Constraints

- No new runtime dependencies.
- The ledger stays in memory; the report response shape does not change.

## Non-goals

- Persisting entries or report data across restarts.
- Changing entry validation or the entry API.

## Work

### 1. Responsive report on large ledgers

**Intent:** Users with large ledgers currently wait on every report request.

**Done when:**

- `AC-001`: With 100,000 entries in a running process, a report request returns in under 50 ms.
- `AC-002`: A report includes every entry added at least 30 seconds before the request.
- `AC-003`: Once no entries have been added for 30 seconds, report totals equal the totals computed directly from all entries.

**Depends on:** None

## Assumptions

- Report requests are far more frequent than bursts of new entries, but both
  happen during normal use.

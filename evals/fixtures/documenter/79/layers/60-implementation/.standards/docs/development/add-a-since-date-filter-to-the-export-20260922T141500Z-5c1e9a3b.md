<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: add-a-since-date-filter-to-the-export-20260922T141500Z-5c1e9a3b
-->

# Development Plan

`Cycle`: `add-a-since-date-filter-to-the-export-20260922T141500Z-5c1e9a3b`
`Mode`: `AUTONOMOUS` `User Style`: `NONE` `User Style Locked`: `true`
`Status`: `IN_PROGRESS` `Verification Cadence`: `AFTER_IMPLEMENTATION`
`Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/add-a-since-date-filter-to-the-export-20260922T141500Z-5c1e9a3b.md`
- `Architecture`: `.standards/docs/specs/add-a-since-date-filter-to-the-export-20260922T141500Z-5c1e9a3b.md`
- `Request`: `Add a --since date filter to the export command.`

## Build Steps

### DEV-001 — Parse and apply --since in export

`Status`: `IN_PROGRESS` `Depends On`: `NONE` `Acceptance`: `AC-001, AC-003`

**Goal**

Export only items updated at or after 00:00:00Z on the given date, and leave
unfiltered export unchanged.

**Affected Area**

`src/export.js` (`parseSince`, `exportItems`).

**Expected Outcome**

`parseSince('2026-08-31')` returns the epoch milliseconds of
2026-08-31T00:00:00Z; `exportItems(items, { since })` keeps items whose
`updatedAt` is at or after that instant; without `since` the output is
byte-identical to the previous export.

**Self-Check**

`node --test test/export.test.js test/import.test.js` in the project root,
Node 22, TZ unset (UTC), against src/export.js ${BLOB:src/export.js}: exit 0,
7 passed. Limitation: the since scenario in test/export.test.js builds its
late-evening timestamp from local-time Date parts, so this pass does not show
the UTC-day boundary independently of the runner's time zone; see Plan Notes.

**Implementation Notes**

Reopened after Tester's full verification found that the filter dropped items
updated earlier on the given day (recovery Frame 1). `parseSince` now builds
the boundary from the date string with an explicit T00:00:00Z suffix. The
change is saved; the step stays open until the corrected since scenario passes.

### DEV-002 — Reject invalid --since values

`Status`: `DONE` `Depends On`: `DEV-001` `Acceptance`: `AC-002`

**Goal**

Reject a `--since` value that is not a `YYYY-MM-DD` date before any output.

**Affected Area**

`src/cli.js` export branch.

**Expected Outcome**

An invalid value prints `invalid --since date: <value> (expected YYYY-MM-DD)`
to stderr, writes nothing to stdout, and returns exit status 2.

**Self-Check**

Same command and run as DEV-001 against src/cli.js ${BLOB:src/cli.js}; the
invalid-date scenario passed.

## Plan Notes

Project references loaded: NONE.

While correcting DEV-001 for Frame 1, the since scenario in
test/export.test.js was found to depend on the runner's time zone. That test
is Tester-owned, so it was routed to TESTING as Frame 2; DEV-001 resumes when
Tester returns.

### Suspended Assignment 1

`Recovery Frame`: `2`
`Recovery Reason`: `The --since test builds fixture timestamps from local-time Date parts, so its expected rows do not follow the UTC day in AC-001.`
`Purpose`: `CORRECTION`
`Target`: `Include items updated earlier on the --since UTC day (Frame 1 correction of DEV-001)`
`Assessed Inputs`: `src/export.js ${BLOB:src/export.js}; test/export.test.js ${BLOB:test/export.test.js}`
`Next Action`: `After Tester returns Frame 2, rerun the test command against the corrected since scenario, finish DEV-001, then resume TESTING for Frame 1.`

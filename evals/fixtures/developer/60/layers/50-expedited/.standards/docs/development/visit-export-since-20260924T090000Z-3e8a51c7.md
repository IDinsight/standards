<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: visit-export-since-20260924T090000Z-3e8a51c7
-->

# Development Plan

`Cycle`: `visit-export-since-20260924T090000Z-3e8a51c7` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true` `Status`: `COMPLETE`
`Verification Cadence`: `AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `NONE`
- `Architecture`: `NONE`
- `Request`: `Add a --since YYYY-MM-DD option to the visit export so only visits on or after that date are exported.`

## Build Steps

### DEV-001 — Date filter helper

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `EXPEDITED_REQUEST`

**Goal**

Provide a helper that keeps visits from a given ISO date onward and rejects
malformed dates.

**Affected Area**

`src/filter.js` (new).

**Expected Outcome**

`filterSince(visits, since)` returns the visits from `since` onward and throws
on a value that is not `YYYY-MM-DD`.

**Self-Check**

Inspection of `src/filter.js`, plus a `node -e` call in the project root that
loaded `data/visits.json` and filtered it with `2026-09-10`: 3 of 5 visits
returned. The same call with `2026/09/10` threw `Invalid --since date`.
Assessed content: working tree before commit.

### DEV-002 — `--since` option on the export CLI

`Status`: `DONE` `Depends On`: `DEV-001` `Acceptance`: `EXPEDITED_REQUEST`

**Goal**

Accept an optional `--since` argument in `bin/export-visits.js` and apply the
date filter before writing CSV, keeping the positional file argument.

**Affected Area**

`bin/export-visits.js`.

**Expected Outcome**

`node bin/export-visits.js --since <date>` exports only visits from that date
onward; without `--since` the export is unchanged.

**Self-Check**

Run in the project root on the working tree before commit:

- `node bin/export-visits.js --since 2026-09-10`: exit 0; header plus the three
  visits dated 2026-09-12 and 2026-09-19.
- `node bin/export-visits.js --since 2026/09/10`: exit 1,
  `Invalid --since date: 2026/09/10`.
- `node bin/export-visits.js`: exit 0; all five visits.
- `node --test test/export.test.js`: exit 0, 3 passed.

## Plan Notes

Expedited cycle: no scope or design records; the contract is the active request.
Project references loaded: NONE.

<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: reading-list-tag-filter-20260924T090000Z-3f9c2a71
-->

# Development Plan

`Cycle`: `reading-list-tag-filter-20260924T090000Z-3f9c2a71` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `false` `Status`: `PROPOSED`
`Verification Cadence`: `AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/reading-list-tag-filter-20260924T090000Z-3f9c2a71.md`
- `Architecture`: `.standards/docs/specs/reading-list-tag-filter-20260924T090000Z-3f9c2a71.md`
- `Request`: `Let readers filter the reading list by tag.`

## Build Steps

### DEV-001 — Tag normalization helper

`Status`: `PENDING` `Depends On`: `NONE` `Acceptance`: `AC-002`

**Goal**

Add a module-local function that normalizes a tag for comparison by trimming it
and lower-casing it.

**Affected Area**

`src/readingList.js`

**Expected Outcome**

One normalization function exists in the module; stored entries and `add`
behavior are unchanged.

**Self-Check**

Planned: `npm test` in the project root; the existing suite must still pass.
Not yet run.

### DEV-002 — Optional tag filter in list()

`Status`: `PENDING` `Depends On`: `DEV-001` `Acceptance`: `AC-001, AC-002`

**Goal**

Let `list()` accept an optional `{ tag }` option and return only entries whose
normalized tags include the normalized query.

**Affected Area**

`src/readingList.js` (`list`)

**Expected Outcome**

`list({ tag: ' Classics ' })` returns only entries tagged `classics` in any
case, in insertion order; `list()` and `list({})` return every entry; returned
tags keep their original spelling.

**Self-Check**

Planned: `npm test` in the project root, plus a short `node -e` sanity check of
`list({ tag })` against a few sample entries. Not yet run.

## Plan Notes

- Project references loaded: NONE.

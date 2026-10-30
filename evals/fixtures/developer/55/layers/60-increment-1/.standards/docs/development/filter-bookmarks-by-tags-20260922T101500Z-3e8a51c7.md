<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: filter-bookmarks-by-tags-20260922T101500Z-3e8a51c7
-->

# Development Plan

`Cycle`: `filter-bookmarks-by-tags-20260922T101500Z-3e8a51c7` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true`
`Status`: `IN_PROGRESS` `Verification Cadence`:
`INCREMENTAL` `Current Increment`: `1`

## Implementation Contract

- `Scope`: `.standards/docs/scope/filter-bookmarks-by-tags-20260922T101500Z-3e8a51c7.md`
- `Architecture`: `.standards/docs/specs/filter-bookmarks-by-tags-20260922T101500Z-3e8a51c7.md`
- `Request`: `Filter bookmarks by tags.`

## Build Steps

### DEV-001 — Single-tag filter

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `AC-001`

**Goal**

Provide `filterByTag(bookmarks, tag)` with the design's tag normalization.

**Affected Area**

New module `src/filter.js`.

**Expected Outcome**

`filterByTag` returns a new array of the bookmarks carrying the requested tag,
compared after trimming and lowercasing, in input order, without modifying the
input.

**Self-Check**

- `node --test test/store.test.js test/format.test.js` in the project root on
  the working tree with `src/filter.js` added: exit 0, 6 passed.
- `node --input-type=module -e` sanity script in the project root importing
  `src/filter.js` with two bookmarks tagged `work` and `home`:
  `filterByTag(items, ' Work ')` returned only the `work` bookmark and
  `filterByTag(items, 'travel')` returned an empty array.

### DEV-002 — Multi-tag filter

`Status`: `PENDING` `Depends On`: `DEV-001` `Acceptance`: `AC-002`

**Goal**

Provide `filterByTags(bookmarks, tags)` on the same normalization helper.

**Affected Area**

`src/filter.js`.

**Expected Outcome**

`filterByTags` returns a new array of the bookmarks carrying every requested
tag after normalization, in input order; an empty tag list returns a copy of the
input and duplicate requested tags count once.

**Self-Check**

Planned: `npm test` in the project root plus a sanity script covering an empty
tag list, duplicate tags, and a bookmark missing one requested tag.

## Verification Increments

### Increment 1

`Development Steps`: `DEV-001` `Acceptance`: `AC-001`

**Ready Outcome**

Callers can filter a bookmark list by one tag, ignoring case and surrounding
spaces, with list order preserved.

### Increment 2

`Development Steps`: `DEV-002` `Acceptance`: `AC-002`

**Ready Outcome**

Callers can filter a bookmark list by several tags, keeping only bookmarks that
carry all of them.

## Plan Notes

- Increment 1 (DEV-001) is ready for Tester; DEV-002 starts after the Increment 1
  return.

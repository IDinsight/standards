<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: filter-bookmarks-by-tags-20260922T101500Z-3e8a51c7
-->

# Development Plan

`Cycle`: `filter-bookmarks-by-tags-20260922T101500Z-3e8a51c7` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true`
`Status`: `IN_PROGRESS` `Verification Cadence`:
`AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

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

- Increment 1 returned VERIFIED. At the user's request the cadence was then
  switched to `AFTER_IMPLEMENTATION`; the current increment was cleared and the
  increment entries are kept for history. Increment 2 will not be handed off on
  its own; DEV-002 goes to full verification once done.
- Before starting DEV-002, `npm test` in the project root passed (exit 0,
  9 passed), but the case-insensitive scenario in `test/filter.test.js` only
  asserts a nonempty result, so it does not show which bookmarks match. Routed to
  Tester as a VERIFICATION failure (recovery Frame 1).

### Suspended Assignment 1

`Recovery Frame`: `1` `Recovery Reason`: `The case-insensitive scenario in test/filter.test.js asserts only that some bookmark matches, so AC-001 matching is not checked.`
`Purpose`: `DEVELOPMENT` `Target`: `NONE`
`Assessed Inputs`: `src/filter.js at ${COMMIT:Add single-tag bookmark filter}; test/filter.test.js at ${COMMIT:Verify single-tag filter increment}`
`Next Action`: `Reload Tester's corrected test/filter.test.js and any reopened DEV-001 work, then start DEV-002 under the effective cadence.`

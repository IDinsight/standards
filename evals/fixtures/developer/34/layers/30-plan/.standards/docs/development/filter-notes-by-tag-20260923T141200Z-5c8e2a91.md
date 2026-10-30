<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: filter-notes-by-tag-20260923T141200Z-5c8e2a91
-->

# Development Plan

`Cycle`: `filter-notes-by-tag-20260923T141200Z-5c8e2a91` `Mode`: `AUTONOMOUS`
`User Style`: `tony` `User Style Locked`: `false`
`Status`: `PROPOSED` `Verification Cadence`:
`AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/filter-notes-by-tag-20260923T141200Z-5c8e2a91.md`
- `Architecture`: `.standards/docs/specs/filter-notes-by-tag-20260923T141200Z-5c8e2a91.md`
- `Request`: `Let users filter the note list by tag.`

## Build Steps

### DEV-001 — Shared tag normalization helper

`Status`: `PENDING` `Depends On`: `NONE` `Acceptance`: `AC-001`

**Goal**

Extract the trim-and-lowercase tag rule into one helper used wherever tags are
normalized.

**Affected Area**

`src/tags.js` (new), `addNote` in `src/notes.js`.

**Expected Outcome**

`normalizeTag(value)` is exported from `src/tags.js`, and `addNote` uses it
with no change in stored tags.

**Self-Check**

Planned: `npm test` from the project root; the existing tag normalization test
must still pass. Not yet run.

### DEV-002 — Optional tag filter in listNotes

`Status`: `PENDING` `Depends On`: `DEV-001` `Acceptance`: `AC-001, AC-002, AC-003`

**Goal**

Let `listNotes` narrow its result to notes carrying one tag.

**Affected Area**

`listNotes` in `src/notes.js`.

**Expected Outcome**

`listNotes(store, { tag })` returns only non-archived notes whose tags include
the normalized tag, newest first; an absent or blank tag returns the current
result unchanged; an unmatched tag returns an empty array.

**Self-Check**

Planned: `npm test` from the project root, plus a quick `node -e` call against
a sample store covering a matching tag, a blank tag, and an unmatched tag. Not
yet run.

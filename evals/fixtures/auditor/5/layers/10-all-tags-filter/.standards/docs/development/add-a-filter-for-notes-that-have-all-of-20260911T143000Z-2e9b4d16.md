<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: add-a-filter-for-notes-that-have-all-of-20260911T143000Z-2e9b4d16
-->

# Development Plan

`Cycle`: `add-a-filter-for-notes-that-have-all-of-20260911T143000Z-2e9b4d16` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true`
`Status`: `COMPLETE` `Verification Cadence`:
`AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/add-a-filter-for-notes-that-have-all-of-20260911T143000Z-2e9b4d16.md`
- `Architecture`: `.standards/docs/specs/add-a-filter-for-notes-that-have-all-of-20260911T143000Z-2e9b4d16.md`
- `Request`: `Add a filter for notes that have all of the requested tags.`

## Build Steps

### DEV-001 — notesWithAllTags filter and export

`Status`: `DONE` `Depends On`: `NONE`
`Acceptance`: `AC-001, AC-002, AC-003`

**Goal**

Add the all-tags filter beside `notesWithAnyTag` and export it.

**Affected Area**

`src/notes.js`, `src/index.js`.

**Expected Outcome**

`notesWithAllTags(notes, tags)` keeps, in input order, the notes for which
`difference(wanted, note.tags)` is empty, where `wanted` is the normalized query
set; it is re-exported from `src/index.js`.

**Self-Check**

`npm test` in the project root on Node.js 20, working tree with this step
applied: exit 0, tests 7, pass 7, fail 0. Manual check in `node` REPL:
`notesWithAllTags` on three sample notes returned the expected ids.

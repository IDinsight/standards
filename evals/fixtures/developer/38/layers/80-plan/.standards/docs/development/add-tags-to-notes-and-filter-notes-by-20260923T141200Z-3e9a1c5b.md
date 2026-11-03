<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: add-tags-to-notes-and-filter-notes-by-20260923T141200Z-3e9a1c5b
-->

# Development Plan

`Cycle`: `add-tags-to-notes-and-filter-notes-by-20260923T141200Z-3e9a1c5b` `Mode`: `AUTONOMOUS`
`User Style`: `tony` `User Style Locked`: `true`
`Status`: `APPROVED` `Verification Cadence`:
`AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/add-tags-to-notes-and-filter-notes-by-20260923T141200Z-3e9a1c5b.md`
- `Architecture`: `.standards/docs/specs/add-tags-to-notes-and-filter-notes-by-20260923T141200Z-3e9a1c5b.md`
- `Request`: `Add tags to notes and filter notes by tag.`

## Build Steps

### DEV-001 — Store normalized tags on new notes

`Status`: `PENDING` `Depends On`: `NONE`
`Acceptance`: `AC-001, AC-003`

**Goal**

`createNote` accepts an optional `tags` array and stores its normalized form on
the note.

**Affected Area**

`src/notes.js`: `createNote` and a new module-local tag normalization helper.

**Expected Outcome**

New notes carry a `tags` array: trimmed, lowercase, empty entries and later
duplicates dropped, first-seen order kept; `[]` when no tags are given. A
non-array `tags` value or a non-string entry throws
`tags must be an array of strings`. Returned notes do not share their `tags`
array with the store.

**Self-Check**

Planned: `npm test` from the project root, plus a `node -e` call creating a note
with `[' Work', 'work', 'Home']` and printing the stored tags. Not yet run.

### DEV-002 — Filter listNotes by tag

`Status`: `PENDING` `Depends On`: `DEV-001`
`Acceptance`: `AC-002, AC-003`

**Goal**

`listNotes` accepts an optional `{ tag }` and returns only matching notes.

**Affected Area**

`src/notes.js`: `listNotes`.

**Expected Outcome**

`listNotes(store, { tag: ' WORK ' })` returns, in creation order, copies of the
notes whose stored tags include `work`. `listNotes(store)` returns every note as
before. Returned `tags` arrays are copies.

**Self-Check**

Planned: `npm test` from the project root, plus a `node -e` call listing a store
with tagged and untagged notes by tag and without one. Not yet run.

### DEV-003 — Show tags in the plain-text export

`Status`: `PENDING` `Depends On`: `DEV-001`
`Acceptance`: `AC-004`

**Goal**

The plain-text export shows a note's tags under its title.

**Affected Area**

`src/format.js`: `formatNote`.

**Expected Outcome**

A note with tags renders `# <title>`, then `Tags: <tag>, <tag>`, then the
existing body section. A note without tags, or without a `tags` property,
renders exactly as before.

**Self-Check**

Planned: `npm test` from the project root, plus a `node -e` call formatting a
tagged and an untagged note. Not yet run.

## Plan Notes

- Approved by the user with User Style `tony`; no step has started yet.
- DEV-002 and DEV-003 depend only on DEV-001 and may follow it in either order;
  the plan lists DEV-002 first.

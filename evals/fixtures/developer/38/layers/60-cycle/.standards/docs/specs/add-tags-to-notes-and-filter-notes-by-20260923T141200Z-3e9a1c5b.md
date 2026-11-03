<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: add-tags-to-notes-and-filter-notes-by-20260923T141200Z-3e9a1c5b
-->

# Technical Design

## Context

Notes live in an in-memory store (`src/notes.js`) and are exported as plain
text by `src/format.js`. Callers receive shallow copies of stored notes. There
is no persistence layer, so no migration is needed.

## Decision

Store tags as an array of strings on each note. Normalization happens once, in
`createNote`, through a module-local helper in `src/notes.js`. Filtering is an
optional argument to the existing `listNotes` rather than a new function, so
current callers are unaffected.

## Acceptance Coverage

- `AC-001`: `createNote` accepts an optional `tags` array and stores the
  normalized result on the note.
- `AC-002`: `listNotes(store, { tag })` filters by the normalized tag.
- `AC-003`: `tags` defaults to an empty array; `listNotes(store)` with no
  options keeps its current result.
- `AC-004`: `formatNote` adds a `Tags:` line after the title when the note has
  at least one tag.

## Interfaces and Contracts

- `createNote(store, { title, body = '', tags = [] })`: `tags` must be an array
  of strings, otherwise throw `Error('tags must be an array of strings')`. Each
  tag is trimmed and lowercased; empty results are dropped; later duplicates
  are dropped. The returned and stored note has a `tags` array.
- `listNotes(store, { tag } = {})`: when `tag` is given, compare its trimmed,
  lowercase form with each note's stored tags. Returned notes are copies whose
  `tags` arrays are also copies.
- `formatNote(note)`: render `# <title>`, then `Tags: <tag>, <tag>` on the next
  line when `note.tags` is a non-empty array, then the existing blank line and
  body. A note object without a `tags` property renders exactly as today.

## Technical Acceptance Criteria

- `AC-001`: `createNote(store, { title: 'x', tags: [' Work', 'work', 'Home'] })`
  stores `['work', 'home']`.
- `AC-002`: Mutating a listed note's `tags` array does not change the stored
  note.
- `AC-004`: `formatNote` output for a note without tags is unchanged byte for
  byte.

## Build Plan

1. Tag normalization and storage in `createNote`.
2. Tag filter in `listNotes`.
3. `Tags:` line in `formatNote`.

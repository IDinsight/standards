<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: add-a-filter-for-notes-that-have-all-of-20260911T143000Z-2e9b4d16
-->

# Technical Design

## Context

`src/notes.js` holds note creation and `notesWithAnyTag`, which normalizes the
query and matches with `intersection` from `src/tags.js`. Public functions are
re-exported from `src/index.js`.

## Decision

Add `notesWithAllTags(notes, tags)` to `src/notes.js`. Build the normalized
query set the same way as `notesWithAnyTag` and keep a note when
`difference(wanted, note.tags)` is empty. Reusing the existing helpers keeps one
normalization path and adds no dependency.

## Acceptance Coverage

- `AC-001`: `notesWithAllTags` in `src/notes.js`; normalization through `normalizeTag`; `Array.prototype.filter` keeps input order.
- `AC-002`: An empty query set has an empty difference with any note, so every note is kept.
- `AC-003`: Re-export from `src/index.js`.
- `AC-004`: No architectural impact — the README entry is Documenter-owned.

## Technical Acceptance Criteria

- `AC-001`: `notesWithAllTags` does not mutate `notes`, the notes' tag sets, or `tags`.

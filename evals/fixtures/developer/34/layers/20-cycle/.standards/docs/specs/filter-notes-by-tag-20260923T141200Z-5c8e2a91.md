<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: filter-notes-by-tag-20260923T141200Z-5c8e2a91
-->

# Technical Design

## Context

`listNotes` in `src/notes.js` already filters archived notes and sorts by
`updatedAt`. Tags are normalized on create with trim and lowercase.

## Decision

Add an optional `tag` option to `listNotes`. Normalize it with the same rule
used on create, extracted into a shared helper so both paths cannot drift.

## Acceptance Coverage

- `AC-001`: `listNotes(store, { tag })` keeps notes whose `tags` include `normalizeTag(tag)`, applied after the archive filter.
- `AC-002`: an absent or blank `tag` skips the tag filter; archive filtering and sort order are unchanged.
- `AC-003`: the tag filter yields an empty array when no remaining note matches.

## Components

- `src/tags.js` (new) — exports `normalizeTag(value)`: trim, then lowercase.
- `src/notes.js` — `addNote` uses `normalizeTag`; `listNotes` gains the `tag`
  option.

## Interfaces and Contracts

- `listNotes(store, { includeArchived = false, tag } = {})`; `tag` is an
  optional string. A value that normalizes to an empty string is treated as
  absent.

## Technical Acceptance Criteria

- `AC-001`: matching uses `normalizeTag` on the option; stored tags are already normalized.
- `AC-002`: calls without `tag` return results identical to the current implementation.

## Build Plan

1. Extract `normalizeTag` and use it in `addNote`.
2. Add the `tag` option to `listNotes`.

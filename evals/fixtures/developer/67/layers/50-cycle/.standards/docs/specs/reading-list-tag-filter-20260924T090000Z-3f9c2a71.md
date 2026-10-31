<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: reading-list-tag-filter-20260924T090000Z-3f9c2a71
-->

# Technical Design

## Context

`createReadingList()` in `src/readingList.js` stores entries in an in-memory
array and returns copies from `list()`. Tags are stored as given.

## Decision

Extend `list()` to accept an optional options object `{ tag }`. Matching
compares a normalized form (trimmed, then lower-cased) of the query and of each
stored tag; stored tags are never rewritten. An absent, empty, or
whitespace-only `tag` means no filter.

## Acceptance Coverage

- `AC-001`: `list(options)` keeps entries whose normalized tags include the
  normalized query, preserving insertion order; no tag means no filter.
- `AC-002`: one module-local normalization function (`trim()` then
  `toLowerCase()`) applied to the query and each stored tag at comparison time.

## Interfaces and Contracts

- `list(options?: { tag?: string })` returns copies of matching entries; the
  entry shape `{ title, author, tags }` is unchanged.

## Technical Acceptance Criteria

- `AC-001`: `list()` and `list({})` return every entry; `list({ tag })` returns
  only matching entries in insertion order.
- `AC-002`: returned `tags` arrays keep the spelling they were added with.

## Build Plan

1. MODIFY `src/readingList.js`: add the normalization helper and the optional
   filter in `list()`.

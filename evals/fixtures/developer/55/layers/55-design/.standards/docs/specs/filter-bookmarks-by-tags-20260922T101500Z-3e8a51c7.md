<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: filter-bookmarks-by-tags-20260922T101500Z-3e8a51c7
-->

# Technical Design

## Context

Bookmarks are held in memory by `src/bookmarks.js`; each has `id`, `url`,
`title`, and `tags`. `addBookmark` trims tags and drops empty ones but keeps
their case. There is no filtering today.

## Decision

Add a module `src/filter.js` with pure functions over a bookmark array. Tag
comparison normalizes both the requested tag and each stored tag with `trim()`
and `toLowerCase()`; stored bookmarks are never modified. Filtering stays out of
the store so callers can filter any list.

## Acceptance Coverage

- `AC-001`: `filterByTag(bookmarks, tag)` in `src/filter.js`.
- `AC-002`: `filterByTags(bookmarks, tags)` in `src/filter.js`, reusing the same normalization.

## Interfaces and Contracts

- `filterByTag(bookmarks, tag)`: returns a new array of the bookmarks whose
  `tags` contain `tag` after normalization, in input order. Does not mutate the
  input.
- `filterByTags(bookmarks, tags)`: returns a new array of the bookmarks that
  contain every tag in `tags` after normalization, in input order. An empty
  `tags` array returns a copy of `bookmarks`; duplicate requested tags count
  once.

## Technical Acceptance Criteria

- `AC-001`: Normalization applies to both sides of the comparison: a requested ` WORK ` matches a stored `work` and a stored `Work`.
- `AC-002`: A bookmark missing any one requested tag is excluded.

## Build Plan

1. Single-tag filter with a shared normalization helper.
2. Multi-tag filter built on the same helper.

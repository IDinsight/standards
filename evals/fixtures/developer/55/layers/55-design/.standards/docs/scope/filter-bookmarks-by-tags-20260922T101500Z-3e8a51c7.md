<!-- STANDARDS
Artifact: SCOPE
Cycle: filter-bookmarks-by-tags-20260922T101500Z-3e8a51c7
-->

# Bookmark Tag Filtering

## Goal

Users collect many bookmarks and need to narrow the list to a topic. Bookmarks
already carry tags, but nothing uses them yet.

## Constraints

- Stored tags keep the case the user typed; filtering must not change stored
  bookmarks.
- No new dependencies.

## Non-goals

- Command-line or UI wiring for the filter.
- Renaming, merging, or listing tags.

## Work

### 1. Filter by one tag

**Intent:** Let a caller narrow the list to one topic.

**Done when:**

- `AC-001`: Filtering by one tag returns exactly the bookmarks carrying that tag, compared case-insensitively and ignoring surrounding spaces, in list order.

**Depends on:** None

### 2. Filter by several tags

**Intent:** Let a caller combine topics to narrow the list further.

**Done when:**

- `AC-002`: Filtering by several tags returns only the bookmarks carrying every requested tag, compared the same way, in list order.

**Depends on:** 1

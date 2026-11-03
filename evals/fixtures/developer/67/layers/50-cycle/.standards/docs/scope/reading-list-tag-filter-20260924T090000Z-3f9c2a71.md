<!-- STANDARDS
Artifact: SCOPE
Cycle: reading-list-tag-filter-20260924T090000Z-3f9c2a71
-->

# Reading List Tag Filter

## Goal

Readers want to narrow the reading list to one tag, such as classics, without
scanning every entry.

## Constraints

- Existing callers of `list()` without arguments keep receiving every book.
- Stored tags keep the spelling the reader entered.

## Non-goals

- Filtering by more than one tag at a time.
- Persisting the list or changing how books are added.

## Work

### 1. Filter by tag

**Intent:** Let a reader see only the books carrying a given tag.

**Done when:**

- `AC-001`: `list({ tag })` returns only the books that carry that tag, in the
  order they were added; `list()` with no tag still returns every book.
- `AC-002`: Tag matching ignores letter case and surrounding whitespace, so
  `" Classics "` matches a book tagged `classics`.

**Depends on:** None

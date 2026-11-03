# Catalog Search

## Goal

Readers need to find publications in the catalog by the words they remember,
whether those words appear in the title or the summary, with the most relevant
records first.

## Constraints

- Search runs over the catalog records the caller passes in; there is no
  external search service.
- Existing callers of `search(records, query)` keep working.

## Non-goals

- Fuzzy, stemmed, or multi-word ranked matching.
- Paging of results.

## Work

### 1. Keyword search

**Intent:** Let readers find records by a word or phrase from the title or
summary.

**Done when:**

- `AC-001`: A query returns every record whose title or summary contains the
  query text, ignoring letter case and surrounding whitespace.
- `AC-002`: Records whose title matches are listed before records that match
  only in the summary, each group in catalog order.

**Depends on:** None

### 2. Query validation

**Intent:** Make a missing query an explicit error rather than an empty or
unfiltered result.

**Done when:**

- `AC-003`: An empty or whitespace-only query is rejected with a `SearchError`.

**Depends on:** None

## Retired Acceptance Identifiers

- `AC-004`: Retired because paging was moved to non-goals; results are returned
  in full.

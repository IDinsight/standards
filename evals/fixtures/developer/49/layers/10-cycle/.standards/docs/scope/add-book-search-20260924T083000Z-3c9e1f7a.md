<!-- STANDARDS
Artifact: SCOPE
Cycle: add-book-search-20260924T083000Z-3c9e1f7a
-->

# Book Search

## Goal

Readers can find books in the catalog by title or author instead of scrolling
the full list, both through the API and on the catalog page.

## Constraints

- Existing `/api/books` and `/api/books/:id` behavior stays unchanged.
- No new runtime dependencies.

## Non-goals

- Ranking, fuzzy matching, or searching fields other than title and author.
- Pagination.

## Work

### 1. Search API

**Intent:** Let API clients, including the catalog page, ask for the books that
match a piece of text.

**Done when:**

- `AC-001`: A client can request the books whose title or author contains a
  given text, ignoring case, and receives them as JSON in catalog order; a
  blank or missing query is rejected as a bad request.

**Depends on:** None

### 2. Search on the catalog page

**Intent:** Let readers narrow the list on the page without leaving it.

**Done when:**

- `AC-002`: The catalog page has a search box; typing text shows only the
  matching books, and clearing it shows the full catalog again.

**Depends on:** 1

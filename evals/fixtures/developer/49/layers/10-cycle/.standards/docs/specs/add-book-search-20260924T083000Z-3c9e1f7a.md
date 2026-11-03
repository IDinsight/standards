<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: add-book-search-20260924T083000Z-3c9e1f7a
-->

# Technical Design

## Context

The catalog is an in-memory list loaded from `data/books.json`. API routing is
a single `route()` function in `src/routes.js`; the page in `public/` fetches
JSON from the API. See `.standards/CONTEXT.md`.

## Decision

Search is a catalog operation exposed through a new GET route on the existing
router, and the page calls that route rather than filtering locally, so the
API and the page share one matching rule.

## Acceptance Coverage

- `AC-001`: `catalog.search(text)` in `src/catalog.js` plus the
  `GET /api/books/search` route in `src/routes.js`.
- `AC-002`: search input in `public/index.html` wired in `public/app.js` to the
  search route.

## Components

- `src/catalog.js` — gains `search(text)`: trims the text, lowercases it, and
  returns the books whose lowercased `title` or `author` contains it, in
  catalog order.
- `src/routes.js` — gains the search route. It must be matched before the
  `/api/books/:id` pattern, which would otherwise treat `search` as an id.
- `public/` — a labelled text input above the list.

## Interfaces and Contracts

- `GET /api/books/search?q=<text>`
  - 200, `application/json`: array of book objects with the same shape as
    `/api/books`, possibly empty.
  - Missing `q`, or `q` that is empty after trimming: 400
    `{ "error": "query required" }`.
- `/api/books` and `/api/books/:id` responses are unchanged.

## Data and Control Flow

Request -> `route()` reads `q` from the query string -> `catalog.search(q)` ->
JSON array. On the page, each `input` event sends the trimmed value to the
search route and renders the returned books with the existing list rendering;
an empty value renders the result of `/api/books` instead.

## Technical Acceptance Criteria

- `AC-001`: `GET /api/books/search?q=<text>` returns 200 with the books whose
  `title` or `author` contains the trimmed `q`, compared case-insensitively, in
  catalog order, or `[]` when nothing matches; a missing or whitespace-only `q`
  returns 400 `{ "error": "query required" }`; existing book routes behave as
  before.
- `AC-002`: the page renders search results from the search route as the user
  types and renders the full catalog again when the input is cleared.

## Build Plan

1. Catalog search and the API route.
2. Page search box using the route.

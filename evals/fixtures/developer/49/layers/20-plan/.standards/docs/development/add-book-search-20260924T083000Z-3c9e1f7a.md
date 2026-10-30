<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: add-book-search-20260924T083000Z-3c9e1f7a
-->

# Development Plan

`Cycle`: `add-book-search-20260924T083000Z-3c9e1f7a` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true`
`Status`: `IN_PROGRESS` `Verification Cadence`:
`INCREMENTAL` `Current Increment`: `1`

## Implementation Contract

- `Scope`: `.standards/docs/scope/add-book-search-20260924T083000Z-3c9e1f7a.md`
- `Architecture`: `.standards/docs/specs/add-book-search-20260924T083000Z-3c9e1f7a.md`
- `Request`: `Add book search to the catalog API and page.`

## Build Steps

### DEV-001 — Search endpoint for title and author

`Status`: `PENDING` `Depends On`: `NONE` `Acceptance`: `AC-001`

**Goal**

Add case-insensitive title and author search to the catalog and expose it as
`GET /api/books/search?q=<text>`.

**Affected Area**

`src/catalog.js` (new `search(text)` on the catalog object) and
`src/routes.js` (new route, matched before `/api/books/:id`).

**Expected Outcome**

`GET /api/books/search?q=guin` returns 200 with the three Le Guin books in
catalog order; matching covers title and author and ignores case
(`q=KINDRED` returns Kindred); no match returns `[]`; a missing or
whitespace-only `q` returns 400 `{ "error": "query required" }`. `/api/books`
and `/api/books/:id` respond as before.

**Self-Check**

Planned: run `npm test` from the repository root (the existing suite must stay
green), then call `route()` directly against `loadCatalog()` for `q=guin`,
`q=KINDRED`, `q=zzz`, `q=%20`, and no `q`, and compare with the expected
outcome above.

### DEV-002 — Search box on the catalog page

`Status`: `PENDING` `Depends On`: `DEV-001` `Acceptance`: `AC-002`

**Goal**

Add a search input to the catalog page that narrows the list through the
search endpoint.

**Affected Area**

`public/index.html`, `public/app.js`, `public/style.css`.

**Expected Outcome**

Typing in the box re-renders the list with the results of
`/api/books/search?q=<trimmed input>`; clearing it re-renders the result of
`/api/books`.

**Self-Check**

Planned: run `npm test`; start the server with `PORT=3100 npm start` and fetch
`/` and `/app.js` to confirm the input and the search call are served. No
browser is available, so in-page behavior is checked by reading
`public/app.js`.

---

## Verification Increments

### Increment 1

`Development Steps`: `DEV-001` `Acceptance`: `AC-001`

**Ready Outcome**

The search endpoint works on its own: API clients can search the catalog by
title or author, blank queries are rejected, and existing book routes are
unchanged.

### Increment 2

`Development Steps`: `DEV-002` `Acceptance`: `AC-002`

**Ready Outcome**

The catalog page filters the list through the search endpoint as the user
types and restores the full list when the box is cleared.

---

## Plan Notes

- Approved by the user as proposed, with no user style and incremental
  verification: Increment 1 is the API, Increment 2 the page.

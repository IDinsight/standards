# Project Context

## Project Baseline

- `catalog-search` is a small library that searches the publications catalog.
  Current behavior: keyword matching over title and summary, ignoring case and
  surrounding whitespace, title matches listed first, and `SearchError` for an
  empty or whitespace-only query. There is no filtering by date or any other
  field.

## Stack and Tooling

- Node.js 22, plain ES modules (`"type": "module"`), no dependencies.
- Tests use `node:test`.

## Structure and Boundaries

- `src/catalog.js` — catalog record shape and sample records.
- `src/search.js` — `search(records, query)` and `SearchError`.
- `test/search.test.js` — tests for the search behavior.
- `docs/product/search.md` — the project's one canonical search scope document.
  It is project-owned and has no STANDARDS provenance block. It currently holds
  `AC-001` to `AC-003` and retired `AC-004`, defined by cycle
  `keyword-search-20260915T140000Z-3c5a9e21`, which was signed off before this
  cycle started; the behavior they describe is implemented and is established
  baseline. That cycle's records remain under `.standards/docs/`.

## Commands

- `npm test` (runs `node --test test/search.test.js`) — full test suite.

## Conventions and Constraints

- Every record has `id`, `title`, `summary`, and `publishedOn`. `publishedOn`
  is an ISO 8601 calendar date string (`YYYY-MM-DD`) with no time or time zone.
- `search(records, query)` is the public entry point; existing callers pass
  only those two arguments.
- Invalid input is reported by throwing `SearchError`.

## Testing and Verification Baseline

- `test/search.test.js` has four tests covering keyword matching, ordering,
  no-match results, and empty-query rejection. All pass.

## Evidence

- `src/search.js`, `src/catalog.js` — current behavior and record shape.
- `docs/product/search.md` and the signed-off state in commit
  `Record keyword search verification, reviews, and sign-off` — the earlier
  cycle's scope and its completion.
- `npm test` — 4 passing tests.

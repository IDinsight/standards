<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: directory-search-20260923T141500Z-5b8e2a19
-->

# Technical Design

## Context

Search is added to the existing in-memory library: `loadUsers` in `src/directory.js` already returns `{ id, name, email }` records (see `.standards/CONTEXT.md`). The scope asks for name search, email search that shows which field matched, and paged results, with no new dependencies.

## Decision

One function, `searchUsers(users, query)` in `src/search.js`, takes a single query string and matches it against both name and email, so callers do not choose a field. Matching is a substring test on normalized text; normalization lives in its own module, `src/normalize.js`, so the query and both fields are folded the same way. Paging is a separate pure function, `paginate(results, { page, size })` in `src/page.js`, so search results stay a plain array.

## Acceptance Coverage

- `AC-001`: `searchUsers` name matching on normalized text; result shape and ordering below.
- `AC-002`: `searchUsers` email matching for people whose name does not match; `matchedOn` on every result.
- `AC-003`: `paginate` in `src/page.js`.

## Components

- `src/search.js` — `searchUsers(users, query)`.
- `src/normalize.js` — `normalize(value)`, shared by the query, names, and emails.
- `src/page.js` — `paginate(results, { page, size })`.

## Interfaces and Contracts

- `normalize(value)`: converts to a string, trims, collapses each run of whitespace to one space, and lowercases.
- `searchUsers(users, query)`: returns a new array of `{ id, name, email, matchedOn }`, where `matchedOn` is `"name"` or `"email"`. A person whose normalized name contains the normalized query is a name match. Otherwise, a person whose normalized email contains it is an email match. A person appears at most once. Name matches come first, then email matches; each group is ordered by `name` with `localeCompare`. A query that normalizes to `""` returns `[]`.
- `paginate(results, { page, size })`: `page` is 1-based and `size` a positive integer; returns `{ items, page, size, total }` where `total` is `results.length`. A page past the end returns empty `items`. A non-integer or non-positive `page` or `size` throws `RangeError`.

## Technical Acceptance Criteria

- `AC-001`: Name matching compares `normalize(name)` with `normalize(query)`; name matches are ordered by name.
- `AC-001`, `AC-002`: Every result, including a name match, has exactly the keys `id`, `name`, `email`, and `matchedOn`.
- `AC-002`: Email matches carry `matchedOn: "email"`, follow every name match, and are ordered by name; a person matching on both appears once with `matchedOn: "name"`.
- `AC-003`: `paginate` returns the requested slice and the total; out-of-range pages are empty; invalid arguments throw `RangeError`.

## Build Plan

1. Name search in `src/search.js` (lowercase substring match, ordered by name).
2. Email search: add `src/normalize.js`, move name matching onto it, add email matching, and add `matchedOn` to every result, name matches included.
3. Paging in `src/page.js`.

## Risks and Follow-up

- `localeCompare` ordering depends on the runtime's ICU data; Node.js 22 ships full ICU.

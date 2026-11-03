<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: add-contact-search-by-name-and-email-20260923T141200Z-5c81e2fa
-->

# Technical Design

## Context

Contacts live in the in-memory store (`src/contacts.js`) and requests are
routed by the pure `route` function in `src/routes.js` (see
`.standards/CONTEXT.md`). Search is a read over `store.list()`; no index is
needed at this size.

## Decision

Add one endpoint, `GET /contacts/search`, implemented in a new module
`src/search.js` and dispatched from `route` before the `/contacts/:id` match.
The endpoint accepts exactly one of `name` or `email`.

## Acceptance Coverage

- `AC-001`: `searchByName(store, query)` in `src/search.js`, reached through
  `GET /contacts/search?name=<q>`.
- `AC-002`: `searchByEmail(store, query)` in `src/search.js`, reached through
  `GET /contacts/search?email=<address>` on the same route.

## Interfaces and Contracts

- `GET /contacts/search?name=<q>` returns `200 { results: Contact[] }` in store
  insertion order, or `400 { error: 'query must be at least 2 characters' }`
  when the trimmed `q` is shorter than 2 characters or `name` is absent.
- `GET /contacts/search?email=<address>` returns `200 { results: Contact[] }`
  with zero or one contact.
- Both `name` and `email` present returns `400 { error: 'use either name or email' }`.

## Technical Acceptance Criteria

- `AC-001`: The `name` value is trimmed before use; matching compares each
  contact's lowercased name against the lowercased trimmed query as a
  substring.
- `AC-001`: A trimmed query of length 0 or 1, including a missing `name`
  parameter, returns status 400 with the error body above and no `results`.
- `AC-002`: The `email` value is trimmed and lowercased and compared for
  equality with stored (already lowercased) emails.
- `AC-002`: Supplying both parameters returns status 400.

## Build Plan

1. Name search: `src/search.js` and the route branch.
2. Email search on the same route, including the both-parameters rejection.

## Risks and Follow-up

- README endpoint list needs the new route once the cycle reaches
  documentation.

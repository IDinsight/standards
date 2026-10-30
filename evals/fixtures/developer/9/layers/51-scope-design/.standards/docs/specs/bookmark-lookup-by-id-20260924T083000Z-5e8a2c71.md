<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: bookmark-lookup-by-id-20260924T083000Z-5e8a2c71
-->

# Technical Design

## Context

Requests are routed in `src/server.js` to handler objects from
`createBookmarkRoutes` (`src/routes/bookmarks.js`) that return
`{ status, body }`. Storage is the JSON file store in `src/store.js`, re-read on
every call. `src/server.js` already maps uncaught errors to 500
`{ "error": "internal_error" }`.

## Decision

Add `getById(id)` to the store and a `get(rawId)` handler. The handler owns id
parsing and error mapping, so the behavior is testable without HTTP and does not
depend on the server's catch-all.

## Acceptance Coverage

- `AC-001`: `store.getById` plus `routes.get` return 200 with the stored object
  unchanged.
- `AC-002`: `routes.get` parses the id with `Number`; ids that are not positive
  integers, and lookups returning `null`, map to 404 `not_found`.
- `AC-003`: `routes.get` catches errors thrown by the store, passes the error to
  the injected `logger.error`, and returns 500 with body
  `{ "error": "internal_error" }` and no other fields.

## Interfaces and Contracts

- `createBookmarkRoutes({ store, logger })`: `logger` defaults to `console`;
  only `logger.error(message, error)` is used.
- `store.getById(id: number)`: the bookmark object or `null`; throws on read or
  parse failure.
- `GET /bookmarks/:id` is wired in `src/server.js` and dispatches to
  `routes.get` with the raw path segment.

## Technical Acceptance Criteria

- `AC-003`: The 500 body has exactly one property, `error`, with value
  `internal_error`; the original error reaches `logger.error`.

## Build Plan

1. Store lookup by id.
2. Handler and server route.
3. Error mapping for store failures.

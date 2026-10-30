<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: user-search-v1-old
-->

# Technical Design

## Context

The directory needs a first search endpoint so people can look up colleagues
by name. Users are loaded once from `data/users.json`; there is no database.

## Decision

Filter the in-memory list with a pure function and expose it through one JSON
route. Prefix matching on the name is enough for the first version and keeps
the function trivial.

## Acceptance Coverage

- `AC-001`: `searchUsers(users, query)` in `src/search.js` returns users whose
  `name` starts with `query`.
- `AC-002`: `GET /users/search?q=<query>` returns status 200 with
  `{ "results": [...] }`.

## Components

- `src/search.js` — `searchUsers(users, query)`, no I/O.
- `src/server.js` — `handleSearch(users, url)` returning `{ status, body }`,
  and the `node:http` server that routes to it.

## Interfaces and Contracts

- `GET /users/search?q=<query>` returns
  `200 { "results": [{ "id", "name", "email" }, ...] }`, results in file order.

## Technical Acceptance Criteria

- `AC-001`: Matching uses `String.prototype.startsWith` on the stored name.
- `AC-002`: The handler never throws for a missing `q`; it treats it as an
  empty string.

## Build Plan

1. Add `searchUsers` with unit tests.
2. Add the handler and route.

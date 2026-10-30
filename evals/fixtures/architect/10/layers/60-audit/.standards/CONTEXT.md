# Project Context

## Project Baseline

- `user-directory` is a small internal Node.js service that loads staff
  accounts from `data/users.json` and serves a JSON search endpoint.
- Search today is a case-sensitive prefix match on `name` only; email
  addresses are never matched.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no runtime or
  dev dependencies.
- Tests use the built-in `node:test` runner and `node:assert/strict`.

## Structure and Boundaries

- `src/users.js` — `loadUsers(file)` reads the JSON file and returns
  `{ id, name, email }` records.
- `src/search.js` — `searchUsers(users, query)`, a pure function that filters
  the in-memory list.
- `src/server.js` — `handleSearch(users, url)` returns `{ status, body }`;
  `createApp(users)` wraps it in a `node:http` server and routes
  `GET /users/search`; other paths get 404 `{ "error": "not found" }`.
- `src/main.js` — start-up: loads `data/users.json` and listens on `PORT`
  (default 3000).
- `data/users.json` — the user list, loaded once at start.

## Commands

- `npm test` (`node --test test/search.test.js test/server.test.js`) — unit
  tests; run from the project root.
- `npm start` — serve the API locally.

## Conventions and Constraints

- Handlers return `{ status, body }` and the server serializes `body` as JSON;
  error bodies use `{ "error": "<message>" }`.
- Business logic stays in pure functions that take the user list as an
  argument; only `src/main.js` touches the file system and network.
- `GET /users/search?q=<query>` returns `{ "results": [...] }` with full user
  records; clients read `results`.

## External Systems and Data

- None. There is no database; the whole user list is held in memory.

## Testing and Verification Baseline

- `test/search.test.js` covers prefix matching and the empty result;
  `test/server.test.js` covers the handler's 200 response shape.

## Relevant Existing Behavior

- An empty or missing `q` matches every user, because every name starts with
  the empty string; results come back in file order with no limit.
- Matching is case-sensitive and does not trim the query.

## Evidence

- `src/search.js`, `src/server.js`, `src/users.js`, `src/main.js` — current
  behavior and boundaries.
- `node --test test/search.test.js test/server.test.js` — 3 tests pass on the
  committed tree.

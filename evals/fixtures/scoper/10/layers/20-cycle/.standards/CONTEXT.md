# Project Context

## Project Baseline

- `user-directory` is a small Node.js library for the internal staff
  directory: an in-memory user list, a search function, and the request
  handler behind the `/search?q=` endpoint.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no runtime or
  development dependencies.

## Structure and Boundaries

- `src/search.js` — `searchUsers(users, query)`: name and email matching.
- `src/directory.js` — `handleSearch(users, params)`: reads `q` from
  `URLSearchParams` and returns `{ status, body }`.
- `src/users.js` — sample user records (`id`, `name`, `email`, `team`).
- `test/search.test.js` — tests for search and the handler.

## Commands

- `npm test` — runs `node --test test/search.test.js`, the full test suite.

## Relevant Existing Behavior

- Name matching is a case-sensitive substring match on the query as given:
  `ada` does not find `Ada Lovelace`.
- The query is not trimmed; surrounding spaces are part of the match, so
  `Hopper ` finds nobody.
- Email matching compares the lowercased query with the stored email, which
  is always lowercase.
- Results keep directory order; there is no ranking.
- An empty `q` returns no results; a missing `q` returns status 400.
- Responses list only `id`, `name`, and `email` for each result.

## Testing and Verification Baseline

- `node:test` with 6 tests in `test/search.test.js`; all pass at HEAD.

## Evidence

- `src/search.js`, `src/directory.js`, `src/users.js` — behavior above.
- `npm test` in the project root — exit 0, 6 passing tests.

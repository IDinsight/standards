# Project Context

## Project Baseline

- `directory` is a small Node.js command-line user directory. Users are loaded
  from `data/users.json`, listed, and searched by name.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no runtime or
  development dependencies.
- Tests use the built-in `node:test` runner with explicit file arguments.

## Structure and Boundaries

- `src/users.js` — `loadUsers(path)` reads the JSON user list.
- `src/search.js` — `searchUsers(users, query)` filters a user list by query;
  the only search logic in the project.
- `src/cli.js` — command-line entry point; prints one `Name <email>` line per
  user shown.
- `data/users.json` — sample directory data; each user has `id`, `name`, and
  `email`.
- `test/` — `users.test.js` (loader) and `search.test.js` (`searchUsers`).

## Commands

- `npm test` (`node --test test/users.test.js test/search.test.js`) — run the
  test suite.
- `npm start` — print every user; `npm start -- <query>` — print matches only.

## Conventions and Constraints

- Functions in `src/` are small named exports with no shared state.
- The CLI output format (`Name <email>`, one per line) is relied on by users of
  the tool.

## Testing and Verification Baseline

- `test/search.test.js` covers partial name matching and blank queries;
  `test/users.test.js` covers loading the sample data. All pass.

## Relevant Existing Behavior

- `searchUsers` trims the query; a blank or whitespace-only query returns an
  empty list.
- Matching is a case-sensitive substring match on `name` only; email addresses
  are not searched.
- Results keep the order of the input list.

## Evidence

- `src/search.js`, `src/cli.js`, `src/users.js`, `test/` — read directly.
- `npm test` — exit 0, 3 tests passing.

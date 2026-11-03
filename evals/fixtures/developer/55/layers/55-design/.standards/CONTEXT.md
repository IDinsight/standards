# Project Context

## Project Baseline

- `bookmarks` is a small in-memory bookmark library with no runtime
  dependencies. Bookmarks can be created, listed, and rendered as text; nothing
  filters them yet.

## Stack and Tooling

- Node.js 22, plain ES modules (`"type": "module"`), no npm dependencies.
- Tests use `node:test` and `node:assert/strict`.

## Structure and Boundaries

- `src/bookmarks.js` — `createStore`, `addBookmark`, `listBookmarks`. The store
  is a plain object passed explicitly. `addBookmark` trims tags and drops empty
  ones but keeps the case the user typed.
- `src/format.js` — text rendering of one bookmark or a list.
- `test/` — one `node:test` file per module.

## Commands

- `npm test` — runs the test files listed in `package.json` with `node --test`.
- `node --test <file>` — runs one test file from the project root.

## Conventions and Constraints

- Library functions are pure where possible and do not mutate their inputs;
  `listBookmarks` returns a new array.
- Test files are listed explicitly in the `test` script.

## Testing and Verification Baseline

- `test/store.test.js` (4 tests) and `test/format.test.js` (2 tests) pass.

## Relevant Existing Behavior

- Stored tags are case-preserving: adding tag ` Work ` stores `Work`.

## Evidence

- `src/bookmarks.js`, `src/format.js`, `package.json` — structure and commands.
- `npm test` — exit 0, 6 passed.

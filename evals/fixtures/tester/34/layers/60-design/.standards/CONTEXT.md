# Project Context

## Project Baseline

- `contacts` (version 1.3.0) is a small library providing an in-memory contact
  directory and display formatting for the support tools. It has no search
  capability yet.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`); no runtime or
  development dependencies.
- Tests use `node:test` with `node:assert/strict`.

## Structure and Boundaries

- `src/directory.js` — `createDirectory(records)`: stores `{ id, name, email }`
  records, lowercases email addresses, rejects duplicate ids; `list()` returns
  contacts in insertion order, `get(id)` returns a contact or `null`.
- `src/format.js` — `formatContact(contact)` renders `Name <email>`.
- `src/index.js` — public exports of the library.
- `test/helpers.js` — `loadFixture(name)` reads a JSON file from
  `test/fixtures/`.
- `test/fixtures/contacts-sample.json` — three contacts, used by the directory
  suite (its order test expects exactly these three).
- `test/fixtures/contacts.json` — eight contacts, used by the format suite.

## Commands

- `npm test` / `pnpm test` — runs the test files listed in the `test` script
  of `package.json` (currently `test/directory.test.js` and
  `test/format.test.js`).
- `node --test <file>` — runs one test file from the project root.

## Conventions and Constraints

- Records passed to `createDirectory` have unique numeric `id`, a `name`, and
  an `email`.
- New test files must be added to the `test` script explicitly.
- No dependencies are added to the library.

## Testing and Verification Baseline

- `test/directory.test.js` (4 tests) and `test/format.test.js` (1 test); all
  pass at audit time.

## Relevant Existing Behavior

- `list()` order is insertion order; downstream consumers rely on it.
- Emails are stored lowercase; names are stored as given.

## Evidence

- `node --test test/directory.test.js test/format.test.js` — exit 0, 5 passed.
- `src/directory.js`, `test/helpers.js`, `package.json` — structure and
  commands above.

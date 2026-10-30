# Contributing

## Running the tests

    pnpm --filter export test

Tests use `node:test` and `node:assert/strict`. Put suites in `test/` and name
them after the behavior they check. Tests that write files use a temporary
folder from `os.tmpdir()` and remove it afterwards.

## Code style

- TypeScript runs through Node's type stripping: use explicit `.ts` import
  specifiers, and no enums or parameter properties.
- Keep handlers synchronous and return an `AppResponse` with an explicit
  `content-type` header.
- Route handlers check roles with `authorize` (or `requireAdmin`) before doing
  anything else.

## Naming

- Exported functions, types, and module-level constants get descriptive names
  (`parseFilter`, `RecordStore`, `ROLES`).
- Inside a function, a short name such as `q`, `n`, `p`, or `i` is fine for a
  value that is used only within a few lines of where it is defined, and for
  callback parameters (`(a, b) => a.id - b.id`). `RecordStore.list` is an
  example. Use a longer name once the value travels further than that.
- Booleans read as statements or questions (`known`, `isAdmin`) when a plain
  noun would be ambiguous.

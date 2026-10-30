# Project Context

## Project Baseline

- `pantry` is a small Node.js command-line stock tracker. Items are stored in a
  JSON file and managed with `add`, `adjust`, `reorder-level`, and `list`.
- Items already carry an optional `reorderLevel` (integer or `null`), set with
  `pantry reorder-level <sku> <level|none>`. No command reads it yet.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no runtime or
  development dependencies.

## Structure and Boundaries

- `src/inventory.js` — in-memory inventory operations and validation.
- `src/format.js` — plain-text table output for `list`.
- `src/store.js` — JSON persistence (`{ "items": [...] }`).
- `src/cli.js` — argument handling; `run(args, { path, out })` returns the exit code.
- `test/` — `node:test` suites.

## Commands

- `npm test` — runs `node --test test/inventory.test.js test/format.test.js`.

## Conventions and Constraints

- Inventory functions throw `Error` with a short message on invalid input; the
  CLI prints the message and exits 1.
- Data file defaults to `pantry.json` in the working folder; `PANTRY_FILE`
  overrides it.

## Testing and Verification Baseline

- Unit tests cover inventory operations and table formatting. `src/cli.js` and
  `src/store.js` have no direct tests.

## Evidence

- `package.json`, `src/*.js`, `test/*.test.js`, `README.md` — inspected at the
  initial commit; `npm test` passes.

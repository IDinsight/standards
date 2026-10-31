# Project Context

## Project Baseline

- `shipquote` is a small Node.js library that prices shipping for shop orders:
  a weight-based rate (`src/shipping.js`), settings parsing and loading
  (`src/settings.js`), and a `quote()` helper that combines subtotal, shipping,
  and total (`src/quote.js`).

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no runtime or
  development dependencies.
- Tests use the built-in `node:test` runner and `node:assert/strict`.

## Structure and Boundaries

- `src/settings.js` — `parseSettings(raw)` merges defaults (base rate 4.5, 4.5
  plus 1.2 per started kilogram, currency EUR) and throws `RangeError` naming
  the key for an invalid rate; `loadSettings(path)` reads a JSON file and parses
  it. Parsed settings are frozen.
- `src/shipping.js` — `shippingCost(order, settings)` and `subtotal(order)`;
  amounts are rounded to cents by `roundCents` in `src/money.js`.
- `src/quote.js` — loads the bundled `config/shipping.json` unless another
  settings path is given.
- `config/shipping.json` — bundled settings used by `quote()`.
- The repository has no README, `docs/` folder, or other user-facing
  documentation. `AGENTS.md` and `CLAUDE.md` contain only the STANDARDS managed
  blocks.

## Nearest Analogues

- Rate validation in `parseSettings` — the established pattern for rejecting
  invalid configuration: a `RangeError` whose message names the setting.

## Commands

- `npm test` — runs
  `node --test test/shipping.test.js test/settings.test.js test/quote.test.js`
  from the project root. Test files are listed explicitly; a new test file must
  be added to the script.

## Conventions and Constraints

- Money values are plain numbers in the settings currency, rounded to cents
  with `roundCents`.
- Order items carry `unitPrice`, `quantity`, and `weightKg`.

## Testing and Verification Baseline

- `test/shipping.test.js`, `test/settings.test.js`, `test/quote.test.js`: 8
  tests, all passing at audit time.

## Relevant Existing Behavior

- Shipping is the base rate plus the per-kilogram rate times the total weight
  rounded up to whole kilograms, and 0 for a weightless order. Every order is
  priced this way today.

## Evidence

- `src/*.js`, `config/shipping.json`, `test/*.test.js`, `package.json`.
- `npm test` in the project root at audit time: exit 0, 8 pass.

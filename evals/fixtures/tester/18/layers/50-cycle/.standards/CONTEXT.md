# Project Context

## Project Baseline

- `bytefmt` 1.2.0: a small Node.js library and CLI that formats byte counts
  for humans using decimal (1000-based) units.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no runtime or
  development dependencies.

## Structure and Boundaries

- `src/format.js` — `formatBytes(bytes, { digits })`, the library entry point.
- `src/cli.js` — `bytefmt` command; formats each numeric argument on its own
  line.
- `test/format.test.js` — `node:test` suite for `formatBytes`.

## Commands

- `node --test test/format.test.js` (the `test` script) — the full test suite.
- `node src/cli.js <bytes>...` — run the CLI from a checkout.

## Conventions and Constraints

- Output is `<value> <unit>` with one space; whole bytes have no decimals;
  larger values use `toFixed(digits)` with `digits` defaulting to 1.
- Negative or non-finite input throws `RangeError`.

## Testing and Verification Baseline

- Tests cover decimal formatting and negative input. The CLI has no automated
  tests.

## Evidence

- `src/format.js`, `src/cli.js`, `test/format.test.js`, `package.json` at the
  audited commit.

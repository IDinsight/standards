# Project Context

## Project Baseline

- `rates` is a small Node.js command-line tool that prints a shipping quote
  for one parcel from its weight and destination zone. User-facing
  documentation is limited to a two-line README.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no
  dependencies.

## Structure and Boundaries

- `src/rates.js` — `quote(weightKg, zone)`, `zones()`, and the zone rate table.
- `bin/rates.js` — CLI wrapper: argument handling, output formatting, exit
  codes.
- `test/rates.test.js` — `node:test` suite for `quote()` and `zones()`.
- `README.md` — project summary.

## Commands

- `npm test` (runs `node --test test/rates.test.js`) — existing unit tests.
- `node bin/rates.js <weight-kg> [zone]` — run the CLI.

## Relevant Existing Behavior

- Billable weight rounds up to the next 0.5 kg (`Math.ceil(weightKg * 2) / 2`).
- Price is the zone base plus per-kg rate times billable weight, rounded to
  cents; the CLI prints it with two decimals and no currency.
- Zones: `domestic` (the CLI default), `regional`, `international`.
- Unknown zone or a weight that is not a positive number: message on stderr,
  exit 1. Missing weight: usage line on stderr, exit 2.

## Evidence

- `src/rates.js`, `bin/rates.js`, `test/rates.test.js` at
  ${COMMIT:Initial rates CLI}.
- `npm test` in the project root: exit 0, 5 tests passed.

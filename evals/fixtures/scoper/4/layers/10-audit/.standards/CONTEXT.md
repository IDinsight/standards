# Project Context

## Project Baseline

- `parcel-rates` is a small shipping quote library used by the checkout
  service. It exposes `quote({ zone, weightKg })` and `zones`.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules, no external dependencies.

## Structure and Boundaries

- `src/rates.js` — zone rate table and the `quote` function.
- `test/rates.test.js` — `node:test` tests for quotes.

## Commands

- `npm test` (`node --test test/rates.test.js`) — runs the test suite.

## Conventions and Constraints

- All amounts are integer cents.
- Weight is charged per started kilogram (`Math.ceil`).
- A quote returns `{ zone, weightKg, lines, total }`, where `lines` is an
  ordered list of `{ label, amount }` and `total` is their sum.

## Testing and Verification Baseline

- Four tests cover line items, zone rates, input rejection, and the zone list;
  all pass.

## Relevant Existing Behavior

- Unknown zones and non-positive weights throw `RangeError`.
- Every quote has exactly two lines today: base rate and weight.

## Evidence

- `src/rates.js`, `test/rates.test.js`, `README.md`.
- `npm test` — 4 passing tests.

# Project Context

## Project Baseline

- `parcel-rates` is a small shipping cost library used by the checkout
  service. It exposes one function, `shippingCost`, in `src/rates.js`.

## Stack and Tooling

- Node 22, plain JavaScript ES modules (`"type": "module"`), no dependencies.

## Structure and Boundaries

- `src/rates.js` — zone rate tables and `shippingCost({ zone, weightKg })`.
- `test/rates.test.js` — `node:test` suite for zone costs and input errors.
- `README.md` — developer-facing usage guide with the zone rate table.
- `CHANGELOG.md` — release notes, newest first.

## Commands

- `node --test test/rates.test.js` (also `npm test`) — runs the test suite.

## Conventions and Constraints

- Costs are rounded to cents; weight is rounded up to whole kilograms.
- Invalid input throws `RangeError`.

## Testing and Verification Baseline

- Four tests cover the three zones and invalid zone or weight input; all pass.

## Relevant Existing Behavior

- `shippingCost` ignores any field other than `zone` and `weightKg`. Existing
  callers rely on the current results for every zone.

## Evidence

- `src/rates.js`, `test/rates.test.js`, `README.md`, `package.json`.

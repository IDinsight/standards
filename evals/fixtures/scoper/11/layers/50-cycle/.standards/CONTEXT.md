# Project Context

## Project Baseline

- Customer account portal that renders the billing summary shown to signed-in
  customers. The summary shows the plan name, monthly price, renewal date, and
  a cancel action.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no external
  dependencies.
- Tests use `node:test`.

## Structure and Boundaries

- `src/billing/copy.js` \u2014 customer-facing strings for the billing summary.
- `src/billing/summary.js` \u2014 renders the billing summary and formats prices.
- `test/summary.test.js` \u2014 tests for the rendered summary and price format.
- `docs/product/scope.md` \u2014 the project's canonical product scope, owned by
  Product. Customer-facing behavior and copy changes, including billing copy,
  are scoped there.

## Commands

- `npm test` (runs `node --test test/summary.test.js`) \u2014 the full test suite.

## Conventions and Constraints

- Customer-facing copy is US English; prices are USD with two decimals
  (`docs/product/scope.md`).
- All billing summary strings live in `src/billing/copy.js`.

## Testing and Verification Baseline

- Two tests in `test/summary.test.js` cover the full rendered summary and
  price formatting; both pass.

## Relevant Existing Behavior

- The renewal line renders the stored calendar date as-is, for example
  `Renews on 2026-09-30`.
- The cancel action is labelled `Cancel plan`.
- No tax note is shown with the price.

## Evidence

- `src/billing/summary.js`, `src/billing/copy.js` \u2014 current rendering and copy.
- `npm test` \u2014 2 passing tests.
- `README.md`, `docs/product/scope.md` \u2014 product scope location and constraints.

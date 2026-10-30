# Project Context

## Project Baseline

- `timesheet` is a small JavaScript library that summarizes time entries
  (`{ date: 'YYYY-MM-DD', minutes }`) into a total and per-day figures.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no external
  dependencies.

## Structure and Boundaries

- `src/summary.js` — `summarize(entries)` returns `{ totalMinutes, byDay }`;
  validates that minutes are non-negative integers.
- `src/format.js` — `formatMinutes(minutes)` display helper.
- `test/summary.test.js` — node:test suite for both modules.

## Commands

- `node --test test/summary.test.js` (also `npm test`) — runs the test suite
  from the project root.

## Conventions and Constraints

- Named exports with JSDoc on exported functions.
- `byDay` keys are sorted by date.

## Testing and Verification Baseline

- Four node:test tests cover totals, per-day grouping, input validation, and
  formatting. All pass on the current baseline.

## Relevant Existing Behavior

- `summarize` returns exactly `totalMinutes` and `byDay`; callers read both.

## Evidence

- `src/summary.js`, `src/format.js`, `test/summary.test.js`, `package.json`.

# Project Context

## Project Baseline

- Small in-memory spending ledger with a per-category totals report. No
  persistence; data lives for the life of the process.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no external
  dependencies.

## Structure and Boundaries

- `src/ledger.js` — `Ledger` stores entries and validates category and integer
  cent amounts.
- `src/report.js` — `categoryReport` sums amounts per category on every call,
  sorted by category name.
- `src/handlers.js` — `getReport` and `postEntry` return `{ status, body }`.
- `docs/report-performance-options.md` — planning notes listing two candidate
  approaches for report speed; no decision recorded.

## Commands

- `npm test` (`node --test test/report.test.js`) — runs the report and handler
  tests.

## Testing and Verification Baseline

- `test/report.test.js` covers totals ordering, the empty report, and rejection
  of non-integer amounts. There is no performance test.

## Relevant Existing Behavior

- Report totals are exact sums over all entries at the moment of the call.
- Invalid entries are rejected with status 400 and are not stored.

## Evidence

- `src/report.js`, `src/ledger.js`, `src/handlers.js` — current behavior.
- `node --test test/report.test.js` — 3 tests pass on the audited commit.

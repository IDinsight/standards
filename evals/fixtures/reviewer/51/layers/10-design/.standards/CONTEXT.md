# Project Context

## Project Baseline

- `circulation` is a small Node.js library used by the branch libraries'
  nightly jobs to track loans and holds and to queue patron email.

## Stack and Tooling

- Node.js 22, plain ES modules (`"type": "module"`), no runtime or dev
  dependencies.

## Structure and Boundaries

- `src/dates.js` — `YYYY-MM-DD` parsing and day differences in UTC.
- `src/loans.js` — loan shape and `daysOverdue` / `isOverdue`.
- `src/mailer.js` — in-memory outbox; `queueMessage` validates the recipient
  and appends the message.
- `src/holds.js` — `queueHoldReadyNotices`, the only current producer of outbox
  messages.

## Nearest Analogues

- `src/holds.js` — filters records and queues one message per match through
  `queueMessage`; `test/holds.test.js` checks the outbox array directly. The
  requested digest differs by grouping several loans into one message per
  borrower.

## Commands

- `npm test` — runs `node --test` over the files listed in `package.json`; a
  new test file must be added to that list.

## Conventions and Constraints

- Functions take an explicit `today` string instead of reading the clock.
- Delivery is done by a separate nightly sender that drains the outbox; it is
  not in this repository.

## Testing and Verification Baseline

- `node:test` with `node:assert/strict`; 4 tests across `test/loans.test.js`
  and `test/holds.test.js`, all passing.

## Evidence

- `package.json`, `src/*.js`, and `test/*.js` at the initial commit; `npm test`
  exit 0 with 4 passing tests.

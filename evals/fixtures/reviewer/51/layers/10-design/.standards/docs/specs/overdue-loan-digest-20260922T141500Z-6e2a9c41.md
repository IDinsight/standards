<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: overdue-loan-digest-20260922T141500Z-6e2a9c41
-->

# Technical Design

## Context

Loans and their overdue arithmetic live in `src/loans.js` (`daysOverdue`); the
outbox is `src/mailer.js` (`queueMessage`). `src/holds.js`
(`queueHoldReadyNotices`) is the nearest analogue: it filters records and
queues one message each.

## Decision

Add `src/digest.js` exporting `buildDigests(loans, today)` (pure grouping and
ordering) and `queueOverdueDigests(loans, today, outbox)` (renders and queues
messages, returning the count). Group by the trimmed, lower-cased borrower
email so one borrower with several loans gets one message even when the
address casing differs between records. `daysOverdue` stays the single source
of overdue arithmetic; `src/loans.js` and `src/mailer.js` are not changed.

## Acceptance Coverage

- `AC-001`: `buildDigests` groups overdue loans by normalized email and emits
  one digest per group; `queueOverdueDigests` queues one message per digest.
- `AC-002`: each digest's items are sorted by days overdue descending, ties by
  title; the body renders one line per item.
- `AC-003`: only loans with `daysOverdue(loan, today) > 0` enter grouping;
  `daysOverdue` already returns 0 for returned loans and loans not yet past
  due.
- `AC-004`: `queueOverdueDigests` calls `queueMessage` with the borrower's email
  and subject `Overdue items: N`.

## Interfaces and Contracts

- `buildDigests(loans, today)` returns an array of
  `{ email, name, items: [{ title, days }] }`; `today` is `YYYY-MM-DD`. `email`
  and `name` come from the borrower's first overdue loan in input order.
  Digests are ordered by normalized email so output is deterministic.
- `queueOverdueDigests(loans, today, outbox)` returns the number of messages
  queued.
- Body: `Hello <name>,`, a blank line, one `- <title> (<days> days overdue)`
  line per item (`1 day` in the singular), a blank line, and a closing line
  asking the borrower to return or renew.

## Technical Acceptance Criteria

- `AC-001`: addresses differing only in case or surrounding spaces are the
  same borrower.
- `AC-002`: ordering is days overdue descending, then title ascending.
- `AC-004`: N in the subject equals the number of item lines in the body.

## Build Plan

1. CREATE `src/digest.js` with grouping, ordering, and rendering.
2. Queue through `queueMessage`; no changes to `src/mailer.js` or
   `src/loans.js`.

## Risks and Follow-up

- Scheduling the digest in the nightly sender is outside this repository and
  this cycle.

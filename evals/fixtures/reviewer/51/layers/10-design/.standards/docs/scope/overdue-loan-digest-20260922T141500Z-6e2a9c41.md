<!-- STANDARDS
Artifact: SCOPE
Cycle: overdue-loan-digest-20260922T141500Z-6e2a9c41
-->

# Overdue Loan Digest

## Goal

Borrowers with overdue loans currently hear nothing until a librarian phones
them. Queue one digest email per borrower that lists everything they have
overdue, so the nightly sender can deliver it with the other notices.

## Constraints

- Messages go through the existing outbox in `src/mailer.js`; delivery stays
  with the nightly sender.
- No new dependencies.

## Non-goals

- Changing how or when the nightly sender delivers mail.
- Fines, renewals, or escalating reminders.
- README or other documentation changes.

## Work

### 1. Overdue digest

**Intent:** Give each borrower a single, readable summary of what they need to
return.

**Done when:**

- `AC-001`: Each borrower with at least one overdue, unreturned loan gets
  exactly one queued message; borrowers with nothing overdue get none.
- `AC-002`: A borrower's message lists each overdue item with its title and the
  number of days it is overdue, most overdue first.
- `AC-003`: Returned loans and loans due today or later never appear in a
  digest.
- `AC-004`: Each message is queued through the existing outbox, addressed to the
  borrower's email, with the subject `Overdue items: N`, where N is the number
  of items listed.

**Depends on:** None

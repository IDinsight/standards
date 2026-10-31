<!-- STANDARDS
Artifact: SCOPE
Cycle: summary-month-filter-20260922T131500Z-6c1e9a40
-->

# Summary Month Filter

## Goal

Let users of `ledger summary` limit the category totals to a single calendar
month, so a monthly review does not require editing or splitting the ledger
file.

## Constraints

- `ledger summary <file>` without a month keeps its current output and exit
  codes.
- Invalid input follows the established convention: message on stderr, exit
  status 2.

## Non-goals

- Date ranges, several months at once, or filters other than one month.
- Changes to the ledger file format.
- README or other guide changes; the user chose to finish this cycle after
  implementation review.

## Work

### 1. Month filter for summary

**Intent:** Monthly totals can be produced from the full ledger in one
command.

**Done when:**

- `AC-001`: `ledger summary <file> --month YYYY-MM` prints category totals
  computed only from entries dated in that month, in the existing output
  format.
- `AC-002`: A `--month` value that is not a valid calendar month in `YYYY-MM`
  form makes the command exit with status 2 and print an error naming the
  expected format, without printing totals.

**Depends on:** None

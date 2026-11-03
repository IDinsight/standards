<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: add-since-filter-to-invoice-list-20260921T141500Z-3c9e1a7b
-->

# Development Plan

`Cycle`: `add-since-filter-to-invoice-list-20260921T141500Z-3c9e1a7b` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true`
`Status`: `COMPLETE` `Verification Cadence`:
`AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `NONE`
- `Architecture`: `NONE`
- `Request`: `Add a --since date filter to the invoices list command.`

## Build Steps

### DEV-001 — Filter the invoice listing by issue date

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `EXPEDITED_REQUEST`

**Goal**

`invoices list` accepts an optional `--since YYYY-MM-DD` and prints only
invoices issued on or after that date.

**Affected Area**

`invoices/cli.py`: the `list` subparser and the `list` branch of `main`.

**Expected Outcome**

Without `--since`, output is unchanged. With `--since`, invoices issued before
the date are omitted and the remaining rows keep issue-date order. An invalid
date is rejected by argparse with exit status 2.

**Self-Check**

- `python3 -m pytest -q` in the project root, on the uncommitted working tree
  over `${COMMIT:Initial project}`: exit 0, 2 passed.
- `python3 -m invoices list --since 2026-03-01 data/sample.json` in the project
  root: printed INV-1003 and INV-1004 only, in issue-date order.
- `python3 -m invoices list --since 2026-13-01 data/sample.json`: argparse
  error, exit 2.
- Limitation: no automated test exercises `--since`; the expedited cycle has no
  Tester phase.

## Plan Notes

Plan approved by the user before implementation. Single step; no suspended
assignments.

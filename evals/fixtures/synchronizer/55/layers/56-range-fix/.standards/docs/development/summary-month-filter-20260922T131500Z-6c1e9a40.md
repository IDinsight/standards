<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: summary-month-filter-20260922T131500Z-6c1e9a40
-->

# Development Plan

`Cycle`: `summary-month-filter-20260922T131500Z-6c1e9a40` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true` `Status`: `COMPLETE`
`Verification Cadence`: `AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- Scope:
  `.standards/docs/scope/summary-month-filter-20260922T131500Z-6c1e9a40.md`
- Architecture:
  `.standards/docs/specs/summary-month-filter-20260922T131500Z-6c1e9a40.md`
- Request: add a `--month YYYY-MM` filter to the ledger summary command.

## Build Steps

### DEV-001 — Month filter helper

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `AC-001`

**Goal**

Provide a helper that keeps only ledger entries dated in a given month.

**Affected Area**

`src/summary.js`

**Expected Outcome**

`inMonth(entries, month)` returns the entries whose date starts with
`<month>-`; existing totals and formatting are unchanged.

**Self-Check**

`node --test test/summary.test.js test/cli.test.js` in the project root on the
working tree with `inMonth` added: 5 tests, 5 pass, exit 0.

### DEV-002 — Parse and validate --month in the CLI

`Status`: `DONE` `Depends On`: `DEV-001` `Acceptance`: `AC-001, AC-002`

**Goal**

Accept an optional `--month <value>` after the file argument, validate it,
and apply the filter before totals are computed.

**Affected Area**

`src/cli.js`

**Expected Outcome**

A valid month (year plus month 01 to 12) prints that month's totals in the
existing format; any other value writes the expected-format message to
stderr, prints no totals, and returns 2; unknown options are usage errors.

**Self-Check**

Original run: `node --test test/summary.test.js test/cli.test.js` on the
working tree, 5 pass, exit 0. After the recovery correction:
`node --test test/summary.test.js test/cli.test.js test/month.test.js` in the
project root on the corrected working tree (before commit): 11 tests,
11 pass, exit 0. `node src/cli.js summary data/sample.csv --month 2026-13` and
`--month 2026-00`: exit 2 with the expected-format message and no stdout.
`--month 2026-09`: September totals unchanged, exit 0.

**Implementation Notes**

Reopened for recovery Frame 2 under unchanged approved intent: the design
requires month 01 to 12, so `isMonth` replaces the pattern-only check.

## Plan Notes

Project references loaded: `NONE`. The user approved the plan before
implementation; no user style was selected.

### Recovery Frame 2 correction

- Frame reason: summary --month accepts out-of-range months such as 2026-13,
  contrary to AC-002. Finding:
  `.standards/docs/reviews/summary-month-filter-20260922T131500Z-6c1e9a40/implementation.md#F-001`.
- DEV-002 reopened and returned to DONE; no change to approved steps, so no
  new approval was needed.
- Rerun plan, rerun boundary `SYNCHRONIZING`: first `TESTING` for full
  re-verification of AC-001 and AC-002 against the corrected `src/cli.js`;
  then `SYNCHRONIZING` to revalidate the corrective evidence in
  `.standards/docs/synchronization/summary-month-filter-20260922T131500Z-6c1e9a40.md`,
  which records the pre-correction `src/cli.js`, `test/month.test.js`,
  verification report, and implementation review as assessed inputs. At that
  boundary Frame 2 is popped and work resumes at `REVIEWING_IMPLEMENTATION`
  for reassessment of the finding and closure eligibility. Frame 1 stays on
  the stack for the outer route.

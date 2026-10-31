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

A valid month prints that month's totals in the existing format; an invalid
value writes the expected-format message to stderr, prints no totals, and
returns 2; unknown options are usage errors.

**Self-Check**

`node --test test/summary.test.js test/cli.test.js` in the project root on the
working tree: 5 tests, 5 pass, exit 0.
`node src/cli.js summary data/sample.csv --month 2026-09`: September totals,
exit 0. `node src/cli.js summary data/sample.csv --month 2026-9`: exit 2 with
the expected-format message and no stdout.

## Plan Notes

Project references loaded: `NONE`. The user approved the plan before
implementation; no user style was selected.

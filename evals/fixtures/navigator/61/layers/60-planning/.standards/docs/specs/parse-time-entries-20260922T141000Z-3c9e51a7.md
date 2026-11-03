<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: parse-time-entries-20260922T141000Z-3c9e51a7
-->

# Technical Design

## Context

Entries are parsed by `parseLine` and `parseEntries` in `src/parse.js`, using `parseDuration` from `src/duration.js`. Today a malformed line throws out of `parseEntries`, so `src/cli.js` stops at the first bad line, and `#` words stay in the description. `src/cli.js` is the only caller of `parseEntries` (see `.standards/CONTEXT.md`).

## Decision

- Keep parsing in `src/parse.js`; no new module and no dependencies.
- `parseLine` stays the single place that decides whether a line is valid. It throws a plain `Error` with a short reason and does not know line numbers.
- `parseEntries` catches per line and returns `{ entries, errors }` instead of an array, so callers get every problem in one pass.
- `parseDuration` is reused unchanged.

## Acceptance Coverage

- `AC-001`: `parseLine` returns `{ date, minutes, description, tags }`.
- `AC-002`: existing `parseDuration` in `src/duration.js`, unchanged; `parseLine` lets its error propagate so the line counts as malformed.
- `AC-003`: `parseLine` splits words starting with `#` into `tags`.
- `AC-004`: `parseLine` validation errors plus the per-line catch in `parseEntries`; `src/cli.js` prints the collected errors.

## Interfaces and Contracts

- `parseLine(line) -> { date: string, minutes: number, description: string, tags: string[] }`; throws `Error(message)` when the line has fewer than three words, the date does not match `YYYY-MM-DD`, or the duration is rejected.
- `parseEntries(text) -> { entries: Entry[], errors: { line: number, message: string }[] }`. Lines are split on `\n`; blank lines are skipped but still counted.
- `timesheet <file>`: one `line N: message` per error on stderr, then `<n> entries, <h>h <m>m` on stdout; exit code 1 when `errors` is not empty, otherwise 0.

## Technical Acceptance Criteria

- `AC-001`: the description is the non-tag words joined with single spaces, in order.
- `AC-003`: tags keep line order and drop the leading `#`.
- `AC-004`: `line` is the 1-based position in the input; entries after a malformed line are still returned.

## Build Plan

1. Validation and tag splitting in `parseLine`.
2. Per-line error collection in `parseEntries`, then the CLI output change.

## Risks and Follow-up

- The `parseEntries` return shape changes from an array to an object; `src/cli.js` is updated in the same change.
- Date checking is format-only, by scope.

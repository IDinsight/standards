<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: add-per-project-hour-totals-to-the-20260921T101200Z-6d1f0b3e
-->

# Technical Design

## Context

`src/report.js` already computes `weeklyTotal` for the Monday-based week and
`src/cli.js` maps arguments to output; see `.standards/CONTEXT.md`.

## Decision

Add `weekRange(anyDate)`, returning the Monday and Sunday of the week, and
`projectTotals(entries, anyDate)` to `src/report.js`. `src/cli.js` accepts one
optional `--by-project` flag and appends the project lines after the existing
total line. `weeklyTotal` is not changed.

## Acceptance Coverage

- `AC-001`: `projectTotals` groups by project and sorts; `run` appends
  two-space-indented `<project>: <hours> h` lines after the total.
- `AC-002`: `projectTotals` rounds each project's sum with the existing
  two-decimal `round` helper after summing.
- `AC-003`: `projectTotals` filters with `weekRange`: an entry counts when
  `start <= date <= end`, both bounds inclusive.
- `AC-004`: No architectural impact — the README content is Documenter-owned.

## Interfaces and Contracts

- `weekRange(anyDate)` takes `YYYY-MM-DD` and returns `{ start, end }`, both
  `YYYY-MM-DD`, with `end` six days after `start`.
- `projectTotals(entries, anyDate)` returns an array of `{ project, hours }`.
  It is empty when the week has no entries; `report --by-project` then prints
  only the total line.
- Any argument after the date other than `--by-project` returns the usage text
  with exit code 2.

## Technical Acceptance Criteria

- `AC-001`: Projects with equal hours sort by `localeCompare` on the name.
- `AC-003`: The comparison against `end` is inclusive, so entries dated on the
  Sunday count.

## Build Plan

1. Add `weekRange` and `projectTotals`.
2. Wire `--by-project` into `run`.

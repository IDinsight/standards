<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: add-an-overdue-filter-to-the-task-list-20260923T141500Z-3f9c6b02
-->

# Technical Design

## Context

`src/tasks.js` exports `listTasks(tasks, options)`, which filters by `status`
and sorts by `due`. Due dates are `YYYY-MM-DD` strings. There is no clock
abstraction in the project.

## Decision

Add an `overdue` boolean option and an optional `now` Date to `listTasks`.
Compare calendar dates as `YYYY-MM-DD` strings, taking today's date from the
UTC date of `now` (default: the current time). The overdue filter runs after the
status filter and before sorting. Accepting `now` keeps the behavior testable
without a clock module.

## Acceptance Coverage

- `AC-001`: `overdue` and `now` options in `listTasks` (`src/tasks.js`); see
  Interfaces and Contracts.
- `AC-002`: No architectural impact — satisfied by the README update in the
  documentation phase.

## Interfaces and Contracts

- `listTasks(tasks, { status?, overdue?, now? })`: `overdue` is a boolean,
  `now` a `Date`. A task is overdue when its `status` is not `done`, it has a
  `due` value, and `due` is earlier than the UTC date of `now`. A task due today
  is not overdue.

## Technical Acceptance Criteria

- `AC-001`: With `overdue: true`, only tasks meeting the overdue rule above are
  returned; the `status` option and the due-date ordering are unchanged, and the
  input array is not mutated.

## Build Plan

1. Extend `listTasks` with the overdue filter.

## Risks and Follow-up

- Callers in time zones far from UTC may see a task become overdue a few hours
  earlier or later than their local midnight; accepted for this change.

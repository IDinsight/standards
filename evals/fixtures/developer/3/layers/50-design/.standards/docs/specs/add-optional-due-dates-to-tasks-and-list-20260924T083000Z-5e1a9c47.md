<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: add-optional-due-dates-to-tasks-and-list-20260924T083000Z-5e1a9c47
-->

# Technical Design

## Context

Tasks are plain objects built by `createTask` in `src/tasks.js`, which throws
`ValidationError` for invalid input. `src/report.js` holds read-only views over
task arrays (`summarize`, `listOpen`). There are no dependencies and no
persistence layer; callers own storage. See `.standards/CONTEXT.md`.

## Decision

Represent a due date on the task object as a calendar-day string `YYYY-MM-DD`,
or `null`. Validate it in `createTask` with an `isValidDate` helper exported
from `src/tasks.js`, and add `listOverdue(tasks, today)` to `src/report.js`,
reusing that helper for `today`. Zero-padded ISO day strings sort
chronologically, so comparisons use plain string ordering and no `Date` objects
are stored; this avoids time-zone shifts for a day-only deadline.

## Acceptance Coverage

- `AC-001`: `createTask` accepts an optional `dueDate` and stores it, or `null`
  when omitted.
- `AC-002`: `isValidDate` check in `createTask`; an invalid value throws
  `ValidationError` before any task object is returned.
- `AC-003`: `listOverdue` in `src/report.js`.

## Interfaces and Contracts

- `isValidDate(value)` (exported from `src/tasks.js`): returns `true` only for a
  string matching `^\d{4}-\d{2}-\d{2}$` that names a real calendar day (the
  year, month, and day survive a `Date.UTC` round trip, so `2026-02-30` is
  rejected); otherwise `false`. Never throws.
- `createTask({ id, title, priority = 'normal', dueDate })`: `dueDate`
  `undefined` or `null` gives `dueDate: null`; any other value must pass
  `isValidDate`, or `createTask` throws `ValidationError` with the message
  `dueDate must be a valid YYYY-MM-DD date`. Existing id, title, and priority
  validation is unchanged. The returned task is
  `{ id, title, priority, done, dueDate }`.
- `completeTask(task)`: unchanged; its copy keeps `dueDate`.
- `listOverdue(tasks, today)` (exported from `src/report.js`): `today` must pass
  `isValidDate`, otherwise `ValidationError` with the message
  `today must be a valid YYYY-MM-DD date`. Returns a new array of the tasks with
  `done === false`, a non-null `dueDate`, and `dueDate < today`, ordered by
  `dueDate` ascending, then `id` ascending. Does not mutate `tasks`.

## Technical Acceptance Criteria

- `AC-001`: `createTask` without `dueDate` returns a task whose `dueDate` is
  `null`; with `2026-10-01` it returns `dueDate: '2026-10-01'`.
- `AC-002`: `2026-02-30`, `2026-13-01`, `10/01/2026`, the empty string, and
  non-string values throw `ValidationError`.
- `AC-003`: a task due on `today` is not overdue; completed tasks and tasks with
  `dueDate: null` are never returned.

## Build Plan

1. Due-date field and validation in `src/tasks.js`.
2. `listOverdue` in `src/report.js`, after step 1 because it reuses
   `isValidDate`.

## Alternatives

- Storing `Date` objects: rejected; day-only deadlines would shift with the
  runtime time zone.

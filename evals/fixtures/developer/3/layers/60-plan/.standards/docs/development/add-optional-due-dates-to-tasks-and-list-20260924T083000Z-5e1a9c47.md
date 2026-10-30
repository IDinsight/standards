<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: add-optional-due-dates-to-tasks-and-list-20260924T083000Z-5e1a9c47
-->

# Development Plan

`Cycle`: `add-optional-due-dates-to-tasks-and-list-20260924T083000Z-5e1a9c47`
`Mode`: `STEPWISE` `User Style`: `NONE` `User Style Locked`: `true`
`Status`: `APPROVED` `Verification Cadence`: `AFTER_IMPLEMENTATION`
`Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/add-optional-due-dates-to-tasks-and-list-20260924T083000Z-5e1a9c47.md`
- `Architecture`: `.standards/docs/specs/add-optional-due-dates-to-tasks-and-list-20260924T083000Z-5e1a9c47.md`
- `Request`: `Add optional due dates to tasks and list overdue tasks.`

## Build Steps

### DEV-001 — Optional, validated due date on tasks

`Status`: `PENDING` `Depends On`: `NONE`
`Acceptance`: `AC-001, AC-002`

**Goal**

Tasks carry an optional calendar-day due date that is validated when the task
is created, as the technical design's Interfaces and Contracts define.

**Affected Area**

`src/tasks.js`: `createTask` and a new exported `isValidDate` helper.

**Expected Outcome**

`createTask` returns `dueDate: null` when no due date is given, stores a valid
`YYYY-MM-DD` day unchanged, and throws `ValidationError` with the message
`dueDate must be a valid YYYY-MM-DD date` for any other value, including
impossible days such as `2026-02-30`. `isValidDate` is exported for reuse.
Existing id, title, and priority behavior is unchanged.

**Self-Check**

Run `npm test` (`node --test test/tasks.test.js test/report.test.js`) from the
project root; both existing suites must still pass. Then run a
`node --input-type=module -e` sanity check from the project root that
`createTask` returns `dueDate: null` without a due date, keeps `2026-10-01`, and
throws `ValidationError` for `2026-02-30` and `10/01/2026`. Not run yet.

### DEV-002 — Overdue listing in the report

`Status`: `PENDING` `Depends On`: `DEV-001`
`Acceptance`: `AC-003`

**Goal**

The report can list open tasks that are past due as of a given day.

**Affected Area**

`src/report.js`: new exported `listOverdue(tasks, today)`.

**Expected Outcome**

`listOverdue` returns a new array of open tasks with a due date before `today`,
ordered by due date and then id, never including completed tasks or tasks
without a due date, and throws `ValidationError` when `today` is not a valid
`YYYY-MM-DD` day. Its input array is left unchanged.

**Self-Check**

Run `npm test` from the project root, then a `node --input-type=module -e`
sanity check over a small task list covering a task due today, a completed
overdue task, a task without a due date, and two overdue tasks in reverse
order. Not run yet.

## Plan Notes

- DEV-002 reuses `isValidDate` from DEV-001 to validate `today`, so it cannot
  start before DEV-001 is `DONE`.
- Approved by the user on 2026-09-24 as written, with collaboration mode
  `STEPWISE` and no user style.

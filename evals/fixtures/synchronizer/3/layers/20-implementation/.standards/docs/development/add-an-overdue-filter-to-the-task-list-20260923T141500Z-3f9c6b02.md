<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: add-an-overdue-filter-to-the-task-list-20260923T141500Z-3f9c6b02
-->

# Development Plan

`Cycle`: `add-an-overdue-filter-to-the-task-list-20260923T141500Z-3f9c6b02` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true`
`Status`: `COMPLETE` `Verification Cadence`:
`AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/add-an-overdue-filter-to-the-task-list-20260923T141500Z-3f9c6b02.md`
- `Architecture`: `.standards/docs/specs/add-an-overdue-filter-to-the-task-list-20260923T141500Z-3f9c6b02.md`
- `Request`: `Add an overdue filter to the task list.`

## Build Steps

### DEV-001 — Overdue option in listTasks

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `AC-001`

**Goal**

Let `listTasks` return only open, past-due tasks when called with
`overdue: true`.

**Affected Area**

`src/tasks.js` (`listTasks`).

**Expected Outcome**

`listTasks(tasks, { overdue: true, now })` keeps tasks that are not `done`, have
a `due` date, and are due before the UTC date of `now` (default: the current
time). The `status` option and the due-date ordering behave as before.

**Self-Check**

`node --test test/tasks.test.js` in the project root on the working tree (commit
`${COMMIT:Record scope and design for overdue filter}` plus the DEV-001 change
to `src/tasks.js`): exit 0, 2 of 2 existing tests passed. A `node -e` call with
`now` set to 2026-09-24T09:00:00Z on a few sample tasks returned only the open
tasks due before that date. Formal overdue tests are left to Tester.

## Plan Notes

The user approved the plan before implementation started. No open questions.

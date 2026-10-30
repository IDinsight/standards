<!-- STANDARDS
Artifact: SCOPE
Cycle: add-optional-due-dates-to-tasks-and-a-20260924T083000Z-3e8a51c7
-->

# Task Due Dates

## Goal

Let users record when a task is due and quickly see which open tasks are past
due, so the task list can be used for time-sensitive work instead of only as an
unordered checklist.

## Constraints

- Task files written by the current version, which have no due dates, must keep
  loading and behave as before.
- Due dates are calendar dates without a time of day.

## Non-goals

- Reminders, notifications, or any background process.
- Recurring tasks.
- Editing or clearing the due date of an existing task.
- Sorting or grouping the regular task list by due date.

## Work

### 1. Due dates on tasks

**Intent:** A user can say when a task must be done at the moment they add it.

**Done when:**

- A task can be added with an optional due date written as `YYYY-MM-DD`, and
  the due date is shown when the task is listed.
- A due date that is not a real calendar date (for example `2026-02-30` or
  `tomorrow`) is rejected with an error message, and no task is saved.
- Tasks added without a due date, and tasks saved before this change, load and
  list exactly as they do today.

**Depends on:** None

### 2. Overdue listing

**Intent:** A user can see at a glance which open tasks have slipped past their
due date.

**Done when:**

- The CLI can list only the open tasks whose due date is earlier than the
  current date.
- A task due on the current date is not overdue.
- Completed tasks and tasks without a due date are never listed as overdue.

**Depends on:** Work item 1

## Assumptions

- "The current date" is the local calendar date of the machine running the
  command.

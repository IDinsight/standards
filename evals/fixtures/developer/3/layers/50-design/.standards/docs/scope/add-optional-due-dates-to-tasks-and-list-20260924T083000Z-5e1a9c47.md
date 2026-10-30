<!-- STANDARDS
Artifact: SCOPE
Cycle: add-optional-due-dates-to-tasks-and-list-20260924T083000Z-5e1a9c47
-->

# Task Due Dates

## Goal

Let callers record when a task is due and find the open tasks that are past
due, so the report can surface late work.

## Constraints

- Due dates are calendar days without a time of day, written `YYYY-MM-DD`.
- Tasks without a due date keep their current behavior in creation,
  completion, summary, and the open-task list.

## Non-goals

- Reminders, recurring due dates, or time-of-day deadlines.
- Changing how the open-task list is ordered.

## Work

### 1. Due dates on tasks

**Intent:** A task can carry the day it is due.

**Done when:**

- `AC-001`: A task can be created with an optional due date in `YYYY-MM-DD`
  form; a task created without one has no due date (`null`).
- `AC-002`: Creating a task with a due date that is not a real calendar day in
  `YYYY-MM-DD` form fails with a validation error and no task is created.

**Depends on:** None

### 2. Overdue listing

**Intent:** Callers can see which open tasks are late as of a given day.

**Done when:**

- `AC-003`: Given a day, the report lists the open tasks whose due date is
  before that day, oldest due date first; completed tasks and tasks without a
  due date are never listed.

**Depends on:** Work item 1.

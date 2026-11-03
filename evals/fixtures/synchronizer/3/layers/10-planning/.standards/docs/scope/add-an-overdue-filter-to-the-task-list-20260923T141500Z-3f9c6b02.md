<!-- STANDARDS
Artifact: SCOPE
Cycle: add-an-overdue-filter-to-the-task-list-20260923T141500Z-3f9c6b02
-->

# Overdue Task Filter

## Goal

Let callers of the task list ask for only the tasks that are past due, so the
daily review can start from what is late.

## Constraints

- Existing `listTasks` calls without the new option keep their current results.

## Non-goals

- Reminders, notifications, or changes to how due dates are written.

## Work

### 1. Overdue filter

**Intent:** Give the daily review a direct way to list late work.

**Done when:**

- `AC-001`: `listTasks` called with the overdue option returns only open tasks
  whose due date is earlier than the current date, in the existing due-date
  order; tasks without a due date are never overdue.
- `AC-002`: The README explains how to request overdue tasks and which tasks
  count as overdue.

**Depends on:** None

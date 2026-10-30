<!-- STANDARDS
Artifact: SCOPE
Cycle: add-task-priority-20260923T141200Z-5c81e2a4
-->

# Task Priority

## Goal

Let users mark how important each task is and see that importance in the task
list, so the most important open work is easy to spot.

## Constraints

- Existing task databases must keep working; their tasks must not be lost or
  need manual changes.
- The existing title rules and create-task error behavior stay as they are.

## Non-goals

- Sorting or filtering the list by priority.
- Changing the priority of an existing task.
- Priority levels other than low, normal, and high.

## Work

### 1. Record a priority for each task

**Intent:** Every task carries one of three priority levels so it can be shown
now and used later.

**Done when:**

- `AC-001`: A task can be created with priority low, normal, or high; a task
  created without a priority has priority normal.
- `AC-002`: Creating a task with any other priority value is rejected with
  status 400, the page shows an error, and no task is stored.
- `AC-003`: Tasks stored before this change appear with priority normal.

**Depends on:** None

### 2. Show and choose priority on the task page

**Intent:** Users see each task's priority and pick one when adding a task.

**Done when:**

- `AC-004`: The task list shows each task's priority, and the new-task form
  lets the user choose low, normal, or high, with normal preselected.

**Depends on:** 1

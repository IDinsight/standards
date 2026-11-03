<!-- STANDARDS
Artifact: SCOPE
Cycle: filter-the-task-list-by-status-assignee-20260921T141203Z-5c81e2a7
-->

# Task List Filters

## Goal

Let callers of the task list narrow results by status, assignee, and due date,
so clients no longer download the whole board and filter it themselves.

## Constraints

- `listTasks` keeps its `{ status, body }` result shape and still returns every
  task when no filter is given.
- Status values are the store's existing set: `open`, `in_progress`, `done`.

## Non-goals

- Sorting, pagination, or free-text search.
- Changes to how tasks are created or stored.

## Work

### 1. Filter the task list

**Intent:** Clients need only the tasks relevant to the view they show, and a
mistyped filter must not look like an empty result.

**Done when:**

- `AC-001`: A `status` query value returns only tasks with that status.
- `AC-002`: An `assignee` query value returns only tasks assigned to that user.
- `AC-003`: `due_from` and `due_to` return only tasks whose due date falls in
  the range, including both end dates; tasks without a due date are excluded
  when either bound is given.
- `AC-004`: An unrecognized `status` value, or a `due_from` or `due_to` value
  that is not a valid `YYYY-MM-DD` calendar date, is rejected with status 400
  and an error naming the parameter, and no tasks are returned.

**Depends on:** None

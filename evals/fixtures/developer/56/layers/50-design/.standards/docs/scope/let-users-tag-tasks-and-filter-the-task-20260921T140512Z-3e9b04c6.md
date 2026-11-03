<!-- STANDARDS
Artifact: SCOPE
Cycle: let-users-tag-tasks-and-filter-the-task-20260921T140512Z-3e9b04c6
-->

# Task Tags

## Goal

Users keep many tasks in one list and need a lightweight way to group them.
Tasks should carry tags, and the list should be filterable by tag so users can
see, for example, only their urgent or work tasks.

## Constraints

- Callers that do not use tags keep the current behavior of `createTask`,
  `updateTask`, and `listTasks`.
- Invalid input continues to be reported with the existing
  `TaskValidationError`.

## Non-goals

- Filtering by more than one tag at a time.
- Renaming, merging, or listing tags across tasks.
- Persistence beyond the existing in-memory store.

## Work

### 1. Tag tasks

**Intent:** Let users attach tags to a task when they create or change it, with
consistent spelling so the same tag is not stored in several forms.

**Done when:**

- `AC-001`: A task can be created or updated with zero or more tags; stored
  tags are trimmed, lowercased, and listed once each in the order first given.
- `AC-002`: A tag that is not a string, is empty after trimming, is longer than
  24 characters, or contains a comma is rejected with `TaskValidationError`,
  and no task is created or changed.

**Depends on:** None

### 2. Filter the list by tag

**Intent:** Let users narrow the task list to one tag.

**Done when:**

- `AC-003`: Listing tasks with a tag returns only the tasks that carry that
  tag, whether the tag is written in any case or with surrounding spaces, and
  the tag filter can be combined with the existing status filter.

**Depends on:** Work item 1.

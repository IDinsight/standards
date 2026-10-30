<!-- STANDARDS
Artifact: SCOPE
Cycle: let-users-tag-tasks-and-filter-the-task-20260923T141200Z-5c9e2a71
-->

# Task Tags

## Goal

Users keep one task list for several areas of work and want to label tasks and
see only the tasks for one area at a time. Add tags to tasks and let the list
be narrowed to a single tag, without changing how existing tasks and commands
behave.

## Constraints

- The task file stays a JSON array of task objects; files written before this
  change must keep working without a manual migration.
- Output of `tasks add`, `tasks done`, and `tasks list` for tasks without tags
  stays exactly as it is today.
- No new runtime dependencies.

## Non-goals

- Adding, removing, or renaming tags on an existing task.
- Filtering by more than one tag at once.
- A command that lists all tags in use.

## Work

### 1. Tag tasks when adding them

**Intent:** Let a user label a task with one or more areas as they create it.

**Done when:**

- `AC-001`: `tasks add` accepts one or more `--tag <name>` options; the new
  task keeps its tags trimmed, lowercased, without duplicates, and in the order
  first given, and its title excludes the options.
- `AC-002`: A task file written before this change, whose tasks have no `tags`
  field, loads and is listed exactly as before, and its tasks count as having
  no tags.

**Depends on:** None

### 2. Filter the list by tag

**Intent:** Let a user see only the tasks for one area.

**Done when:**

- `AC-003`: `tasks list --tag <name>` shows only the open tasks that carry that
  tag, matching case-insensitively; with `--all` it also includes completed
  tasks that carry it.

**Depends on:** 1

### 3. Show tags in the list

**Intent:** Make a task's tags visible wherever the task is listed.

**Done when:**

- `AC-004`: Each listed task that has tags shows them after its title as
  `#name` words separated by single spaces, in stored order; tasks without tags
  print as before.

**Depends on:** 1

## Assumptions

- Tag names are single words; a value given to `--tag` is used as-is after
  trimming and lowercasing.

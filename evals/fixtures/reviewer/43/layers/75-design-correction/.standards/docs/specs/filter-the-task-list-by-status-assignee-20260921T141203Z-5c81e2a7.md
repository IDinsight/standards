<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: filter-the-task-list-by-status-assignee-20260921T141203Z-5c81e2a7
-->

# Technical Design

## Context

`listTasks(store)` in `src/tasks.js` returns every task from the in-memory
`TaskStore` (`src/store.js`). The host application passes query-string values
through as strings.

## Decision

Parse the query in a new `src/query.js` module (`parseListQuery`) and apply the
parsed filters in `listTasks(store, query)`. Parsing also validates values and
throws `QueryError`; `listTasks` maps that error to a 400 result. Filtering
stays in memory; all given filters apply together.

## Acceptance Coverage

- `AC-001`: `parseListQuery` passes a known `status` through; `listTasks` keeps
  tasks whose `status` equals it.
- `AC-002`: `assignee` is compared as a string against `task.assignee`.
- `AC-003`: `due_from` and `due_to` are compared as `YYYY-MM-DD` strings with
  inclusive bounds; a task with `due: null` fails any bound.
- `AC-004`: `parseListQuery` throws `QueryError` (carrying `parameter`) for a
  status outside `STATUSES` or a date that is not a real calendar date;
  `listTasks` returns `{ status: 400, body: { error, parameter } }`.

## Interfaces and Contracts

- `listTasks(store, query = {})` returns `{ status: 200, body: { tasks } }` or
  `{ status: 400, body: { error, parameter } }`.
- `parseListQuery(query)` returns an object with any of `status`, `assignee`,
  `due_from`, `due_to`, or throws `QueryError`.

## Technical Acceptance Criteria

- `AC-003`: A task due exactly on `due_from` or `due_to` is included.
- `AC-004`: Validation runs before any filtering, so a rejected query never
  returns a `tasks` array.

## Build Plan

1. Query parsing with status and assignee filters.
2. Due-date range filter.
3. Parameter validation and the 400 mapping.

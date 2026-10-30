<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: add-task-priority-20260923T141200Z-5c81e2a4
-->

# Technical Design

## Context

The scope adds a three-level priority to tasks. The project keeps validation in
`TaskService`, schema and persistence in `TaskStore`, rendering in
`app/views.py`, and exception-to-status mapping in `app/web.py` (see
`.standards/CONTEXT.md`). There is no migration framework, and existing
database files must keep working.

## Decision

Store priority as a text column with a database default of `normal`, add the
column in place when an older database is opened, validate values in the
service against a fixed tuple, and render priority as a badge in each list item
plus a select in the new-task form. A text column keeps rows readable and
matches the form values; an integer code was rejected because nothing orders by
priority yet.

## Acceptance Coverage

- `AC-001`: `TaskService.create_task` priority parameter and default;
  `TaskStore.add` and the `priority` column persist it; `Task.priority` returns
  it.
- `AC-002`: `TaskService.create_task` raises `ValueError` before storing;
  `handle_create` uses its existing 400 path.
- `AC-003`: In-place column addition in `TaskStore.__init__` with database
  default `normal`.
- `AC-004`: Priority badge in `_task_item` and priority select in
  `render_new_task_form`.

## Components

- `app/models.py` — `Task` gains `priority`.
- `app/store.py` — schema, in-place column addition, persistence of priority.
- `app/service.py` — allowed values, default, validation.
- `app/web.py` — passes the submitted value to the service.
- `app/views.py` — badge and select.

## Interfaces and Contracts

- `Task(id, title, done=False, priority="normal")`: `priority` is the last
  field, so existing positional construction keeps working.
- Schema: `SCHEMA` adds `priority TEXT NOT NULL DEFAULT 'normal'` for new
  databases. `TaskStore.__init__` reads `PRAGMA table_info(tasks)` after running
  `SCHEMA`; if there is no `priority` column it runs
  `ALTER TABLE tasks ADD COLUMN priority TEXT NOT NULL DEFAULT 'normal'` and
  commits.
- `TaskStore.add(title, priority="normal") -> Task`; `get` and `list` select
  `priority` and return it on each `Task`. The store does not validate
  priority.
- `app/service.py` defines `PRIORITIES = ("low", "normal", "high")` and
  `DEFAULT_PRIORITY = "normal"`. `TaskService.create_task(title, priority=None)`:
  the title rules run first, unchanged. A priority that is `None`, empty, or
  only whitespace becomes `DEFAULT_PRIORITY`; any other value is stripped and
  must equal one of `PRIORITIES` exactly (case-sensitive), otherwise
  `ValueError("priority must be one of low, normal, high")` is raised and
  nothing is stored.
- `handle_create(service, form)` passes `form.get("priority")` as the priority.
  A `ValueError` keeps the existing response: status 400 with the list page
  re-rendered and the error message shown. Success stays `303, "/tasks"`.
- List item: the `<li>` keeps its existing attributes and escaped title,
  followed by a space and `<span class="priority priority-{value}">{Label}</span>`,
  where `{Label}` is `Low`, `Normal`, or `High`. Values pass through
  `html.escape`.
- Form: after the title input, `<label for="priority">Priority</label>` and
  `<select id="priority" name="priority">` with options `low`, `normal`, `high`
  in that order, labelled `Low`, `Normal`, `High`; the `normal` option carries
  `selected`.

## Data and Control Flow

Form post -> `handle_create` -> `TaskService.create_task` (validate title, then
priority) -> `TaskStore.add` -> 303 to `/tasks`. List request ->
`TaskService.list_tasks` -> `TaskStore.list` -> `render_task_list`.

## Technical Acceptance Criteria

- `AC-001`: `create_task("x")` returns and stores a task with priority
  `normal`; `create_task("x", "high")` stores `high`; likewise for `low` and
  `normal`.
- `AC-002`: `create_task("x", "urgent")` and `create_task("x", "High")` raise
  `ValueError` and leave `list_tasks()` unchanged; `handle_create` returns
  status 400 with the error message in the body.
- `AC-003`: Opening a database file created with the previous schema adds the
  column without losing rows, and those rows return priority `normal`.
- `AC-004`: The rendered list contains one priority badge per task with the
  contract markup; the form contains the select with `normal` preselected.

## Build Plan

1. Persistence: model field, schema, in-place column addition, store methods.
2. Service: allowed values, default, validation.
3. UI: handler wiring, list badge, form select.

## Risks and Follow-up

- `ALTER TABLE ... ADD COLUMN` with a constant default is supported by every
  SQLite version bundled with Python 3; no data copy is needed.

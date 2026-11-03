<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: add-task-priority-20260923T141200Z-5c81e2a4
-->

# Development Plan

`Cycle`: `add-task-priority-20260923T141200Z-5c81e2a4` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `false`
`Status`: `PROPOSED` `Verification Cadence`:
`AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/add-task-priority-20260923T141200Z-5c81e2a4.md`
- `Architecture`: `.standards/docs/specs/add-task-priority-20260923T141200Z-5c81e2a4.md`
- `Request`: `Let users give each task a priority (low, normal, or high) and see it in the task list.`

## Build Steps

### DEV-001 — Persist task priority

`Status`: `PENDING` `Depends On`: `NONE` `Acceptance`: `AC-001, AC-003`

**Goal**

Every stored task carries a priority, defaulting to `normal`, including tasks in
database files created before this change.

**Affected Area**

`app/models.py` (`Task`) and `app/store.py` (`SCHEMA`, `TaskStore.__init__`,
`add`, `get`, `list`, `_task`).

**Expected Outcome**

`Task` has a last field `priority` defaulting to `normal`. New databases get the
`priority TEXT NOT NULL DEFAULT 'normal'` column from `SCHEMA`; opening an older
database adds the column with `ALTER TABLE`, and its existing rows read back as
`normal`. `TaskStore.add(title, priority="normal")` stores the given value, and
`get` and `list` return it.

**Self-Check**

Planned: `python3 -m pytest tests/test_store.py` from the project root, plus a
scratch script outside the repository that creates a database file with the
pre-change `tasks` schema, opens it with the updated `TaskStore`, and confirms
its rows read back with priority `normal`.

### DEV-002 — Validate and default priority in the service

`Status`: `PENDING` `Depends On`: `DEV-001` `Acceptance`: `AC-001, AC-002`

**Goal**

`TaskService.create_task` accepts an optional priority, applies the default, and
rejects values outside the allowed set before anything is stored.

**Affected Area**

`app/service.py` (`PRIORITIES`, `DEFAULT_PRIORITY`, `TaskService.create_task`).

**Expected Outcome**

`create_task(title, priority=None)` keeps the existing title rules, turns a
missing or blank priority into `normal`, stores `low`, `normal`, or `high` as
given, and raises `ValueError("priority must be one of low, normal, high")` for
any other value with nothing stored.

**Self-Check**

Planned: `python3 -m pytest tests/test_service.py`, plus scratch calls of
`create_task` with no priority, each allowed value, `urgent`, and `High`,
confirming the stored values and that rejected calls store nothing.

### DEV-003 — Show and choose priority on the task page

`Status`: `PENDING` `Depends On`: `DEV-002` `Acceptance`: `AC-002, AC-004`

**Goal**

The create handler passes the submitted priority to the service, the list shows
each task's priority, and the form offers the three levels.

**Affected Area**

`app/web.py` (`handle_create`) and `app/views.py` (`_task_item`,
`render_new_task_form`).

**Expected Outcome**

`handle_create` passes `form.get("priority")`; an invalid value returns status
400 through the existing error path. Each list item ends with
`<span class="priority priority-{value}">{Label}</span>`, and the form has the
labelled `priority` select with `normal` preselected, as the design's contract
defines.

**Self-Check**

Planned: `python3 -m pytest` (full suite), plus scratch calls of
`handle_create` with `high` and with `urgent` and a render of the list page,
inspecting the badge and select markup.

## Plan Notes

- Self-checks use the existing suite and scratch calls outside the repository;
  acceptance tests for this cycle belong to Tester.

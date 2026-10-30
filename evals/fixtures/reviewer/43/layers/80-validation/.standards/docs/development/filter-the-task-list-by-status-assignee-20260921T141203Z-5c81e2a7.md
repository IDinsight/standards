<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: filter-the-task-list-by-status-assignee-20260921T141203Z-5c81e2a7
-->

# Development Plan

`Cycle`: `filter-the-task-list-by-status-assignee-20260921T141203Z-5c81e2a7`
`Mode`: `STEPWISE` `User Style`: `NONE` `User Style Locked`: `true`
`Status`: `COMPLETE` `Verification Cadence`: `INCREMENTAL`
`Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/filter-the-task-list-by-status-assignee-20260921T141203Z-5c81e2a7.md`
- `Architecture`: `.standards/docs/specs/filter-the-task-list-by-status-assignee-20260921T141203Z-5c81e2a7.md`
- `Request`: `Filter the task list by status, assignee, and due-date range.`

## Build Steps

### DEV-001 — Parse list query parameters

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `AC-001, AC-002`

**Goal**

Read the supported filter parameters from the query object passed to
`listTasks`.

**Affected Area**

New `src/query.js` (`parseListQuery`); `src/tasks.js`.

**Expected Outcome**

`listTasks(store, query)` receives a parsed filter object; a call without a
query behaves as before.

**Self-Check**

`node --test test/store.test.js` in the repository root on the DEV-001 working
tree; exit 0, 4 tests passed.

### DEV-002 — Status and assignee filters

`Status`: `DONE` `Depends On`: `DEV-001` `Acceptance`: `AC-001, AC-002`

**Goal**

Keep only tasks matching the given status and assignee.

**Affected Area**

`src/tasks.js` (`matches`).

**Expected Outcome**

`status` and `assignee` each narrow the list, and together both apply.

**Self-Check**

`node --test test/store.test.js` in the repository root; exit 0, 4 tests
passed. In a `node` session, `listTasks(store, { status: 'open' })` on a
four-task store returned the two open tasks.

### DEV-003 — Due-date range filter

`Status`: `DONE` `Depends On`: `DEV-001` `Acceptance`: `AC-003`

**Goal**

Filter by an inclusive `due_from` / `due_to` range.

**Affected Area**

`src/query.js`, `src/tasks.js` (`matches`).

**Expected Outcome**

Tasks due on either end date are included; undated tasks are excluded when a
bound is given.

**Self-Check**

`node --test test/store.test.js test/list-tasks.test.js` in the repository
root; exit 0, 7 tests passed. In a `node` session, `due_from: '2026-10-01'`,
`due_to: '2026-10-03'` returned the tasks due on both end dates.

### DEV-004 — Reject invalid filter values

`Status`: `DONE` `Depends On`: `DEV-001, DEV-003` `Acceptance`: `AC-004`

**Goal**

Validate `status`, `due_from`, and `due_to` and answer an invalid value with
400 naming the parameter.

**Affected Area**

`src/query.js` (`QueryError`, calendar-date check), `src/tasks.js` (400
mapping).

**Expected Outcome**

An unknown status or invalid date returns `{ status: 400, body: { error,
parameter } }` with no `tasks` array; valid queries are unchanged.

**Self-Check**

`node --test test/store.test.js test/list-tasks.test.js` in the repository
root on the DEV-004 working tree (`src/query.js`, `src/tasks.js` modified);
exit 0, 9 tests passed. In a `node` session, `status: 'archived'` returned 400
with `parameter: 'status'` and `due_to: '2026-02-30'` returned 400 with
`parameter: 'due_to'`.

**Implementation Notes**

Calendar validity is checked by round-tripping through `Date`, so dates such as
`2026-02-30` are rejected rather than rolled over.

## Verification Increments

### Increment 1

`Development Steps`: `DEV-001, DEV-002` `Acceptance`: `AC-001, AC-002`

**Ready Outcome**

`listTasks` filters by status and by assignee, alone or together.

### Increment 2

`Development Steps`: `DEV-003, DEV-004` `Acceptance`: `AC-003, AC-004`

**Ready Outcome**

`listTasks` filters by an inclusive due-date range and rejects an unknown
status or invalid date with 400 naming the parameter.

## Plan Notes

- Increment 1 passed Tester assessment before the recovery.
- Recovery frame 1 (scope correction) added AC-004. Increment 2 had not passed
  assessment, so DEV-004 and AC-004 were added to it instead of appending a new
  increment; the user approved the revised plan before DEV-004 started.
- All steps are DONE and Current Increment is NONE. Handed to Tester after
  DEV-004.

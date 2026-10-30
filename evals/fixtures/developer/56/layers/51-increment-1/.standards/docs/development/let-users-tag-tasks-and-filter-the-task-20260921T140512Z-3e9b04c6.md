<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: let-users-tag-tasks-and-filter-the-task-20260921T140512Z-3e9b04c6
-->

# Development Plan

`Cycle`: `let-users-tag-tasks-and-filter-the-task-20260921T140512Z-3e9b04c6` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true`
`Status`: `IN_PROGRESS` `Verification Cadence`: `INCREMENTAL`
`Current Increment`: `1`

## Implementation Contract

- `Scope`: `.standards/docs/scope/let-users-tag-tasks-and-filter-the-task-20260921T140512Z-3e9b04c6.md`
- `Architecture`: `.standards/docs/specs/let-users-tag-tasks-and-filter-the-task-20260921T140512Z-3e9b04c6.md`
- `Request`: `Let users tag tasks and filter the task list by tag.`

## Build Steps

### DEV-001 — Store normalized tags on create and update

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `AC-001`

**Goal**

Tasks carry a list of normalized tags that callers set when creating or
updating a task.

**Affected Area**

New `src/tags.js` (`normalizeTag`, `normalizeTags`); `createTask` and
`updateTask` in `src/tasks.js`; copies of the `tags` array in `src/store.js`.

**Expected Outcome**

`createTask` and `updateTask` accept `tags`; stored tags are trimmed,
lowercased, and listed once in first-seen order; a task created without tags
has an empty list; `updateTask` without `tags` keeps the existing list;
mutating a returned `tags` array does not change the stored task.

**Self-Check**

`node --test test/tasks.test.js` in the project root, Node 22, on the
uncommitted working tree on top of
`${COMMIT:Record project context, scope, and design for task tags}`: exit 0,
5 tests, 5 passed. Sanity check with `node --input-type=module -e`: creating a
task with tags ` Urgent `, `home`, `URGENT` returned `urgent`, `home`;
`updateTask` with tags `Work` returned `work`; pushing onto a returned `tags`
array left the stored task unchanged. Limitation: the existing suite has no
tag scenarios.

### DEV-002 — Reject invalid tags before saving

`Status`: `DONE` `Depends On`: `DEV-001` `Acceptance`: `AC-002`

**Goal**

Invalid tag values are rejected with `TaskValidationError` before the store is
touched.

**Affected Area**

`normalizeTag` in `src/tags.js`; evaluation order in `createTask` and
`updateTask`.

**Expected Outcome**

A tag that is not a string, is empty after trimming, has more than 24
characters, or contains a comma throws `TaskValidationError`; no task is
created, and an updated task keeps its previous values.

**Self-Check**

`node --test test/tasks.test.js` in the project root, Node 22, same working
tree as DEV-001: exit 0, 5 passed. Sanity check with
`node --input-type=module -e`: creating a task with an all-space tag, a
25-character tag, or `home,work` each threw `TaskValidationError` and the store
stayed empty; an `updateTask` call with one invalid tag threw and the stored
task kept its title and tags.

### DEV-003 — Filter listTasks by tag

`Status`: `PENDING` `Depends On`: `DEV-001` `Acceptance`: `AC-003, AC-001`

**Goal**

`listTasks` accepts an optional tag filter.

**Affected Area**

`listTasks` in `src/tasks.js`.

**Expected Outcome**

`listTasks(store, { tag })` returns only tasks carrying the tag after the filter
value is normalized with `normalizeTag`; it combines with `status`; an invalid
filter value throws `TaskValidationError`.

**Self-Check**

Planned: `node --test test/tasks.test.js test/tags.test.js` plus a sanity check
of the filter alone and combined with `status`.

## Verification Increments

### Increment 1

`Development Steps`: `DEV-001, DEV-002` `Acceptance`: `AC-001, AC-002`

**Ready Outcome**

Tasks can be created and updated with tags that are stored normalized, and
invalid tags are rejected without changing the store.

### Increment 2

`Development Steps`: `DEV-003` `Acceptance`: `AC-003, AC-001`

**Ready Outcome**

`listTasks` filters by a tag, alone or with `status`, normalizing the filter
value the same way as stored tags.

## Plan Notes

- The design's Build Plan steps 1 and 2 map to DEV-001 and DEV-002; step 3 maps
  to DEV-003.

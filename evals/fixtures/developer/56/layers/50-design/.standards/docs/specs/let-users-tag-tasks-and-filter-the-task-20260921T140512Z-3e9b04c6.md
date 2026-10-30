<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: let-users-tag-tasks-and-filter-the-task-20260921T140512Z-3e9b04c6
-->

# Technical Design

## Context

Tasks live in the in-memory `TaskStore`, and all validation happens in
`src/tasks.js` before the store is called (see `.standards/CONTEXT.md`). The
scope adds tags on create and update, rejection of invalid tags, and a tag
filter on the list.

## Decision

Represent tags as an array of normalized strings on each task. Put the tag
rules in a new `src/tags.js` module used both by writes and by the list filter,
so stored tags and filter input follow one normalization. Validate every tag
before any store call.

## Acceptance Coverage

- `AC-001`: `tags` array on every task; `normalizeTags` in `src/tags.js`
  applied by `createTask` and `updateTask`; `TaskStore` copies the array.
- `AC-002`: `normalizeTag` throws `TaskValidationError` for invalid values
  before the store is called.
- `AC-003`: `listTasks(store, { status, tag })`; the `tag` value is normalized
  with `normalizeTag` and matched exactly against stored tags.

## Components

- `src/tags.js` (new) — `MAX_TAG_LENGTH` (24), `normalizeTag(value)`,
  `normalizeTags(values)`.
- `src/tasks.js` — accepts `tags` on create and update; adds the `tag` filter.
- `src/store.js` — copies `tags` arrays on insert, get, replace, and all.

## Interfaces and Contracts

- `createTask(store, { title, status = 'open', tags = [] })` returns the stored
  task including `tags`.
- `updateTask(store, id, changes)` replaces the tag list when `changes.tags` is
  present and keeps it otherwise.
- `listTasks(store, { status, tag } = {})`: both filters are optional; when both
  are given a task must match both.
- `normalizeTag(value)` throws `TaskValidationError` when `value` is not a
  string, is empty after trimming, is longer than 24 characters after trimming,
  or contains a comma; otherwise it returns the trimmed, lowercased tag.
- `normalizeTags(values)` throws `TaskValidationError` unless `values` is an
  array; it returns the normalized tags with duplicates removed, in first-seen
  order.

## Technical Acceptance Criteria

- `AC-001`: Every task returned by the store has a `tags` array, and mutating a
  returned array does not change the stored task.
- `AC-002`: No store method is called when any tag in the request is invalid.
- `AC-003`: `listTasks` normalizes the `tag` filter exactly as writes do, so
  ` Urgent ` matches a stored `urgent`.

## Build Plan

1. Add `src/tags.js` and store support for copying tags.
2. Accept tags on create and update with validation.
3. Add the `tag` filter to `listTasks`.

## Risks and Follow-up

- An invalid `tag` filter value throws `TaskValidationError` instead of
  returning an empty list; callers must handle it.

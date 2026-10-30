<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: let-users-tag-tasks-and-filter-the-task-20260923T141200Z-5c9e2a71
-->

# Technical Design

## Context

The CLI (`bin/tasks.js` -> `run` in `src/cli.js`) parses arguments by position
and keeps all task logic in pure functions in `src/store.js`, which load and
save a JSON array. Tasks today are `{ id, title, done }`. See
`.standards/CONTEXT.md`.

## Decision

Add a `tags` array to the task record, normalize tags in one store function,
filter in `listTasks`, and teach `run` to separate `--tag` options from
positional words. Old files are normalized when loaded rather than migrated on
disk.

## Acceptance Coverage

- `AC-001`: `normalizeTags` and the `tags` option of `addTask` in
  `src/store.js`; option parsing for `add` in `src/cli.js`.
- `AC-002`: `loadTasks` fills a missing `tags` field with `[]`; `formatTask`
  prints no tag suffix for an empty list.
- `AC-003`: the `tag` option of `listTasks`; option parsing for `list` in
  `src/cli.js`.
- `AC-004`: tag suffix in `formatTask`.

## Components

- `src/store.js` — task model, normalization, persistence, and filtering. Stays
  free of argument parsing and printing.
- `src/cli.js` — argument parsing, dispatch, and output formatting.

## Interfaces and Contracts

- Task record: `{ id: number, title: string, done: boolean, tags: string[] }`.
  New and saved tasks always carry `tags`; `[]` when none.
- `normalizeTags(values: string[]): string[]` — trim each value, lowercase it,
  drop empty strings, and remove duplicates keeping first-occurrence order.
- `addTask(tasks, title, { tags = [] } = {})` — stores `normalizeTags(tags)`;
  the return shape is unchanged (`{ tasks, task }`).
- `loadTasks(file)` — returns tasks with `tags: []` added where the field is
  missing; it does not write the file.
- `listTasks(tasks, { includeDone = false, tag } = {})` — when `tag` is given,
  keeps only tasks whose `tags` include the normalized `tag`; the open/completed
  rule is unchanged.
- CLI options: `--tag <name>` may repeat on `add`; `list` takes at most one
  `--tag <name>` and the existing `--all`. Options may appear anywhere after the
  command; every other word is positional. `--tag` with no following word
  prints the usage line and returns exit code 1 without changing the file.
- `formatTask(task)` — unchanged for tasks with no tags; otherwise appends a
  space and the tags as `#name` joined by single spaces.

## Data and Control Flow

`run` loads tasks, splits options from positional words, then calls the store
function for the command; `add` and `done` save the returned array.
Normalization happens on write (`addTask`) and on filter input (`listTasks`);
missing `tags` are filled on load.

## Technical Acceptance Criteria

- `AC-001`: `tasks add Buy milk --tag Home --tag errands --tag home` stores
  title `Buy milk` and tags `["home", "errands"]`.
- `AC-002`: loading `[{"id":1,"title":"x","done":false}]` yields a task with
  `tags: []`, and `tasks list` prints `1. [ ] x`.
- `AC-003`: `listTasks` with `tag: "HOME"` returns only tasks tagged `home`,
  applying `includeDone` as before.
- `AC-004`: a task with tags `["home", "errands"]` formats as
  `1. [ ] Buy milk #home #errands`.

## Build Plan

1. Store model: `tags` field, `normalizeTags`, the `addTask` option, and load
   normalization.
2. Filtering in `listTasks`.
3. CLI: option parsing for `add` and `list`, and the tag suffix in
   `formatTask`.

## Risks and Follow-up

- A tag value that itself starts with `--` is taken literally as the tag;
  acceptable for now.

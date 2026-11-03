<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: sort-tasks-by-due-date-20260922T141000Z-3c9e1f5a
-->

# Development Plan

`Cycle`: `sort-tasks-by-due-date-20260922T141000Z-3c9e1f5a` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true` `Status`: `COMPLETE`
`Verification Cadence`: `AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `NONE`
- `Architecture`: `NONE`
- `Request`: `Sort the task list by due date, with undated tasks last.`

## Build Steps

### DEV-001 — Due-date ordering in the task list

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `EXPEDITED_REQUEST`

**Goal**

Print tasks with the earliest due date first and tasks without a due date
last, without changing the line format or the open/done count.

**Affected Area**

`src/tasks.js` (new `sortByDue`), `src/cli.js` (applies it after the
open/all filter), `test/tasks.test.js`.

**Expected Outcome**

`node src/cli.js <file>` lists tasks ordered by due date, undated tasks at the
end, ties in file order. `formatTask` and `summarize` output is unchanged.

**Self-Check**

`node --test test/tasks.test.js` from the project root on `src/tasks.js`
(`${BLOB:src/tasks.js}`), `src/cli.js` (`${BLOB:src/cli.js}`), and
`test/tasks.test.js` (`${BLOB:test/tasks.test.js}`), uncommitted at the time:
exit 0, 7 passed. `node src/cli.js tasks.example.json --all` printed the
electricity bill (2026-09-28), the plumber (2026-09-30), the passport
(2026-10-15), then the undated club book.

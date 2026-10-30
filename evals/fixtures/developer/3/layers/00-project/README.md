# taskboard

Small dependency-free helpers for task records.

- `src/tasks.js`: `createTask({ id, title, priority })` builds a validated task;
  `completeTask(task)` returns a completed copy. Invalid input throws
  `ValidationError`.
- `src/report.js`: `summarize(tasks)` counts open and done tasks;
  `listOpen(tasks)` lists open tasks by priority (high, normal, low), then id.

Run the tests with `npm test`.

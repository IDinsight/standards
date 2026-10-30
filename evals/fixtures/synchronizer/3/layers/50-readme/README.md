# tasklist

Small task list helpers for the team's daily review script.

## Usage

```js
import { listTasks } from './src/tasks.js';

listTasks(tasks);                     // all tasks, earliest due date first
listTasks(tasks, { status: 'open' }); // only open tasks
listTasks(tasks, { overdue: true });  // only overdue tasks
```

Tasks are plain objects with `id`, `title`, `status` (`open` or `done`), and an
optional `due` date written as `YYYY-MM-DD`. Tasks without a due date sort last.

### Overdue tasks

Pass `overdue: true` to list only overdue tasks, in the usual due-date order. A
task is overdue when it is not `done`, has a `due` date, and that date is
earlier than today. A task due today is not overdue, and tasks without a due
date are never overdue.

"Today" is the UTC date of the current time. Pass `now` (a `Date`) to evaluate
the list as of another moment:

```js
listTasks(tasks, { overdue: true, now: new Date('2026-09-24T09:00:00Z') });
```

`overdue` can be combined with `status`.

## Tests

```sh
npm test
```

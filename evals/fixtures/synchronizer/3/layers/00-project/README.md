# tasklist

Small task list helpers for the team's daily review script.

## Usage

```js
import { listTasks } from './src/tasks.js';

listTasks(tasks);                     // all tasks, earliest due date first
listTasks(tasks, { status: 'open' }); // only open tasks
```

Tasks are plain objects with `id`, `title`, `status` (`open` or `done`), and an
optional `due` date written as `YYYY-MM-DD`. Tasks without a due date sort last.

## Tests

```sh
npm test
```

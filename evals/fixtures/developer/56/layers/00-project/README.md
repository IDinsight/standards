# tasks

A small in-memory task list library with no dependencies.

## Usage

```js
import { TaskStore } from './src/store.js';
import { createTask, listTasks, updateTask } from './src/tasks.js';

const store = new TaskStore();
const task = createTask(store, { title: 'Buy milk' });
updateTask(store, task.id, { status: 'done' });
listTasks(store, { status: 'open' });
```

Invalid input throws `TaskValidationError` (see `src/errors.js`).

## Tests

```sh
npm test
```

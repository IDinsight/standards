import { addTask, completeTask, listTasks, loadTasks, saveTasks } from './store.js';

const USAGE = 'usage: tasks add <title> | done <id> | list [--all]';

export function formatTask(task) {
  return task.id + '. [' + (task.done ? 'x' : ' ') + '] ' + task.title;
}

export async function run(argv, { file = 'tasks.json', out = console.log } = {}) {
  const [command, ...rest] = argv;
  const tasks = await loadTasks(file);
  switch (command) {
    case 'add': {
      const { tasks: next, task } = addTask(tasks, rest.join(' '));
      await saveTasks(file, next);
      out('added ' + task.id);
      return 0;
    }
    case 'done': {
      await saveTasks(file, completeTask(tasks, Number(rest[0])));
      out('completed ' + rest[0]);
      return 0;
    }
    case 'list': {
      const includeDone = rest.includes('--all');
      for (const task of listTasks(tasks, { includeDone })) out(formatTask(task));
      return 0;
    }
    default:
      out(USAGE);
      return 1;
  }
}

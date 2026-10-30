#!/usr/bin/env node
import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { loadTasks, saveTasks } from './store.js';
import { addTask, completeTask, formatTask, openTasks } from './tasks.js';

export function run(args, file = process.env.TASKLOG_FILE ?? 'tasks.json') {
  const [command, ...rest] = args;
  const tasks = loadTasks(file);
  switch (command) {
    case 'add': {
      const next = addTask(tasks, rest.join(' '));
      saveTasks(file, next);
      return `added ${next.at(-1).id}`;
    }
    case 'done': {
      saveTasks(file, completeTask(tasks, Number(rest[0])));
      return `completed ${rest[0]}`;
    }
    case 'list': {
      const shown = rest.includes('--all') ? tasks : openTasks(tasks);
      return shown.map(formatTask).join('\n');
    }
    default:
      throw new Error(`unknown command: ${command ?? ''}`);
  }
}

const invoked = process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
if (invoked) {
  try {
    console.log(run(process.argv.slice(2)));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

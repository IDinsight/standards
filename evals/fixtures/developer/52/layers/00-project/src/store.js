import { readFile, writeFile } from 'node:fs/promises';

export async function loadTasks(file) {
  let text;
  try {
    text = await readFile(file, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
  return JSON.parse(text);
}

export async function saveTasks(file, tasks) {
  await writeFile(file, JSON.stringify(tasks, null, 2) + '\n');
}

export function addTask(tasks, title) {
  const trimmed = title.trim();
  if (!trimmed) throw new Error('title is required');
  const id = tasks.reduce((max, task) => Math.max(max, task.id), 0) + 1;
  const task = { id, title: trimmed, done: false };
  return { tasks: [...tasks, task], task };
}

export function completeTask(tasks, id) {
  if (!tasks.some((task) => task.id === id)) throw new Error('no task ' + id);
  return tasks.map((task) => (task.id === id ? { ...task, done: true } : task));
}

export function listTasks(tasks, { includeDone = false } = {}) {
  return tasks.filter((task) => includeDone || !task.done);
}

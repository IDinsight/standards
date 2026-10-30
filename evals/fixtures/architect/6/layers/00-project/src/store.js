import { existsSync, readFileSync, writeFileSync } from 'node:fs';

export function loadTasks(file) {
  if (!existsSync(file)) return [];
  const data = JSON.parse(readFileSync(file, 'utf8'));
  return Array.isArray(data.tasks) ? data.tasks : [];
}

export function saveTasks(file, tasks) {
  writeFileSync(file, `${JSON.stringify({ version: 1, tasks }, null, 2)}\n`);
}

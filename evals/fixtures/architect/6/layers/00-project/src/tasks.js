export function addTask(tasks, title, now = new Date()) {
  const trimmed = String(title ?? '').trim();
  if (!trimmed) throw new Error('title is required');
  const id = tasks.reduce((max, task) => Math.max(max, task.id), 0) + 1;
  return [...tasks, { id, title: trimmed, done: false, createdAt: now.toISOString() }];
}

export function completeTask(tasks, id) {
  if (!tasks.some((task) => task.id === id)) throw new Error(`no task ${id}`);
  return tasks.map((task) => (task.id === id ? { ...task, done: true } : task));
}

export function openTasks(tasks) {
  return tasks.filter((task) => !task.done);
}

export function formatTask(task) {
  return `${task.done ? '[x]' : '[ ]'} ${task.id}. ${task.title}`;
}

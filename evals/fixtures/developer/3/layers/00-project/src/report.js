const RANK = { high: 0, normal: 1, low: 2 };

export function summarize(tasks) {
  const done = tasks.filter((task) => task.done).length;
  return { total: tasks.length, open: tasks.length - done, done };
}

export function listOpen(tasks) {
  return tasks
    .filter((task) => !task.done)
    .sort((a, b) => RANK[a.priority] - RANK[b.priority] || a.id - b.id);
}

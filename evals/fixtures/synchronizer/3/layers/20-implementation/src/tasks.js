// Task list helpers used by the daily review script.

function byDue(a, b) {
  if (a.due === b.due) return a.id - b.id;
  if (!a.due) return 1;
  if (!b.due) return -1;
  return a.due < b.due ? -1 : 1;
}

function utcDate(date) {
  return date.toISOString().slice(0, 10);
}

export function listTasks(tasks, options = {}) {
  let result = tasks;
  if (options.status) result = result.filter((task) => task.status === options.status);
  if (options.overdue) {
    const today = utcDate(options.now ?? new Date());
    result = result.filter((task) => task.status !== 'done' && task.due && task.due < today);
  }
  return [...result].sort(byDue);
}

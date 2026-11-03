// Task list helpers used by the daily review script.

function byDue(a, b) {
  if (a.due === b.due) return a.id - b.id;
  if (!a.due) return 1;
  if (!b.due) return -1;
  return a.due < b.due ? -1 : 1;
}

export function listTasks(tasks, options = {}) {
  let result = tasks;
  if (options.status) result = result.filter((task) => task.status === options.status);
  return [...result].sort(byDue);
}

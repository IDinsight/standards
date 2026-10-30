const PRIORITIES = ['high', 'normal', 'low'];

export function parseTasks(text) {
  const data = JSON.parse(text);
  if (!Array.isArray(data)) throw new Error('task file must contain a JSON array');
  return data.map((item, index) => normalizeTask(item, index));
}

function normalizeTask(item, index) {
  if (!item || typeof item.title !== 'string' || !item.title.trim()) {
    throw new Error(`task ${index + 1} needs a title`);
  }
  const priority = item.priority ?? 'normal';
  if (!PRIORITIES.includes(priority)) {
    throw new Error(`task ${index + 1} has unknown priority "${priority}"`);
  }
  const due = item.due ?? null;
  if (due !== null && !/^\d{4}-\d{2}-\d{2}$/.test(due)) {
    throw new Error(`task ${index + 1} has a malformed due date`);
  }
  return { title: item.title.trim(), priority, due, done: Boolean(item.done) };
}

// Earliest due date first; tasks without a due date go last. Tasks with the
// same due date keep their order from the file.
export function sortByDue(tasks) {
  return tasks
    .map((task, position) => ({ task, position }))
    .sort((a, b) => {
      if (a.task.due === b.task.due) return a.position - b.position;
      if (a.task.due === null) return 1;
      if (b.task.due === null) return -1;
      return a.task.due < b.task.due ? -1 : 1;
    })
    .map(({ task }) => task);
}

export function formatTask(task) {
  const box = task.done ? '[x]' : '[ ]';
  const due = task.due ? ` (due ${task.due})` : '';
  const flag = task.priority === 'high' ? ' !' : '';
  return `${box} ${task.title}${due}${flag}`;
}

export function summarize(tasks) {
  const open = tasks.filter((task) => !task.done).length;
  return `${open} open, ${tasks.length - open} done`;
}

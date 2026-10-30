export const STATUSES = ['open', 'in_progress', 'done'];

export class TaskStore {
  constructor(tasks = []) {
    this.tasks = new Map();
    this.nextId = 1;
    for (const task of tasks) this.add(task);
  }

  add({ title, status = 'open', assignee = null, due = null }) {
    if (!STATUSES.includes(status)) throw new Error(`unknown status: ${status}`);
    const task = { id: this.nextId++, title, status, assignee, due };
    this.tasks.set(task.id, task);
    return task;
  }

  get(id) {
    return this.tasks.get(id) ?? null;
  }

  all() {
    return [...this.tasks.values()];
  }
}

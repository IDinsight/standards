export class TaskStore {
  constructor() {
    this.rows = new Map();
    this.nextId = 1;
  }

  insert(fields) {
    const task = { id: this.nextId, ...fields };
    this.nextId += 1;
    this.rows.set(task.id, task);
    return { ...task };
  }

  get(id) {
    const task = this.rows.get(id);
    return task ? { ...task } : null;
  }

  replace(task) {
    this.rows.set(task.id, { ...task });
  }

  all() {
    return [...this.rows.values()].map((task) => ({ ...task }));
  }
}

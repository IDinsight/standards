function copy(task) {
  return { ...task, tags: [...(task.tags ?? [])] };
}

export class TaskStore {
  constructor() {
    this.rows = new Map();
    this.nextId = 1;
  }

  insert(fields) {
    const task = copy({ id: this.nextId, ...fields });
    this.nextId += 1;
    this.rows.set(task.id, task);
    return copy(task);
  }

  get(id) {
    const task = this.rows.get(id);
    return task ? copy(task) : null;
  }

  replace(task) {
    this.rows.set(task.id, copy(task));
  }

  all() {
    return [...this.rows.values()].map(copy);
  }
}

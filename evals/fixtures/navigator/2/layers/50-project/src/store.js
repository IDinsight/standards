export class MemoryStore {
  constructor() {
    this.rows = new Map();
    this.nextId = 1;
  }

  async save(contact) {
    const row = { id: this.nextId, ...contact };
    this.nextId += 1;
    this.rows.set(row.id, row);
    return row;
  }

  async get(id) {
    return this.rows.get(id) ?? null;
  }
}

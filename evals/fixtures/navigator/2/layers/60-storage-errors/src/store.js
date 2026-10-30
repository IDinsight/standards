export class StoreFullError extends Error {}

export class MemoryStore {
  constructor({ limit = Infinity } = {}) {
    this.limit = limit;
    this.rows = new Map();
    this.nextId = 1;
  }

  async save(contact) {
    if (this.rows.size >= this.limit) {
      throw new StoreFullError(`store limit of ${this.limit} contacts reached`);
    }
    const row = { id: this.nextId, ...contact };
    this.nextId += 1;
    this.rows.set(row.id, row);
    return row;
  }

  async get(id) {
    return this.rows.get(id) ?? null;
  }
}

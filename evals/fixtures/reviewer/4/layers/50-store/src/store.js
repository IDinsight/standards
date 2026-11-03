export const STATUSES = ['active', 'archived'];

export class RecordStore {
  #records = new Map();

  add(record) {
    if (this.#records.has(record.id)) throw new Error(`record ${record.id} already exists`);
    this.#records.set(record.id, { ...record });
  }

  get(id) {
    const record = this.#records.get(id);
    return record ? { ...record } : undefined;
  }

  // Records matching every given filter (exact status and owner), ordered by
  // id. Callers get copies.
  list(filter = {}) {
    return [...this.#records.values()]
      .filter((record) => !filter.status || record.status === filter.status)
      .filter((record) => !filter.owner || record.owner === filter.owner)
      .sort((a, b) => a.id - b.id)
      .map((record) => ({ ...record }));
  }
}

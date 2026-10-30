// In-memory record store. Records are plain objects:
// { id, title, owner, status: 'active' | 'archived', createdAt (ISO 8601, UTC) }.
export class RecordStore {
  #records;

  constructor(seed = []) {
    this.#records = seed.map((record) => ({ ...record }));
  }

  // Records matching every given filter, ordered by id. Callers get copies.
  list(filter = {}) {
    const q = filter.q?.toLowerCase();
    return this.#records
      .filter((record) => !filter.status || record.status === filter.status)
      .filter((record) => !filter.owner || record.owner === filter.owner)
      .filter((record) => !q || record.title.toLowerCase().includes(q))
      .sort((a, b) => a.id - b.id)
      .map((record) => ({ ...record }));
  }

  get(id) {
    const record = this.#records.find((candidate) => candidate.id === id);
    return record ? { ...record } : undefined;
  }
}

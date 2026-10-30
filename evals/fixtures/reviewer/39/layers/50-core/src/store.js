// In-memory record store keyed by id.
export class RecordStore {
  #records = new Map();

  constructor(records = []) {
    for (const record of records) this.add(record);
  }

  // Adds or replaces a record. Ids must be positive integers; numeric strings
  // from CSV input are accepted.
  add(record) {
    const id = Number(record.id);
    if (!Number.isInteger(id) || id < 1) throw new Error(`invalid record id: ${record.id}`);
    this.#records.set(id, { id, title: String(record.title ?? ''), owner: String(record.owner ?? '') });
  }

  // Records ordered by id. Callers get copies.
  list() {
    return [...this.#records.values()].sort((a, b) => a.id - b.id).map((record) => ({ ...record }));
  }

  get size() {
    return this.#records.size;
  }
}

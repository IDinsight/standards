export class RecordStore {
  #records = new Map();
  #nextId = 1;

  create({ title, body = '' }) {
    const record = { id: this.#nextId, title, body, archived: false };
    this.#nextId += 1;
    this.#records.set(record.id, record);
    return { ...record };
  }

  get(id) {
    const record = this.#records.get(id);
    return record ? { ...record } : null;
  }

  list() {
    return [...this.#records.values()].map((record) => ({ ...record }));
  }

  update(id, changes) {
    const record = this.#records.get(id);
    if (!record) return null;
    if (changes.title !== undefined) record.title = changes.title;
    if (changes.body !== undefined) record.body = changes.body;
    return { ...record };
  }

  archive(id) {
    const record = this.#records.get(id);
    if (!record) return null;
    record.archived = true;
    return { ...record };
  }

  delete(id) {
    return this.#records.delete(id);
  }
}

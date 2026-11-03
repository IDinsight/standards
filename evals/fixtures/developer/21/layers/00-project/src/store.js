import { readFile, writeFile } from 'node:fs/promises';

export class RecordStore {
  constructor(records = []) {
    this.records = new Map(records.map((record) => [record.id, record]));
  }

  static async open(path) {
    try {
      return new RecordStore(JSON.parse(await readFile(path, 'utf8')));
    } catch (error) {
      if (error.code === 'ENOENT') return new RecordStore();
      throw error;
    }
  }

  get(id) {
    return this.records.get(id) ?? null;
  }

  put(record) {
    this.records.set(record.id, record);
  }

  list() {
    return [...this.records.values()];
  }

  async save(path) {
    await writeFile(path, `${JSON.stringify(this.list(), null, 2)}\n`);
  }
}

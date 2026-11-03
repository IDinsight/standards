export type RecordStatus = 'active' | 'archived';

export type RecordItem = {
  id: number;
  title: string;
  owner: string;
  status: RecordStatus;
  createdAt: string;
};

export type RecordFilter = {
  status?: RecordStatus;
  owner?: string;
  q?: string;
};

export class RecordStore {
  #records: RecordItem[];

  constructor(seed: readonly RecordItem[] = []) {
    this.#records = seed.map((record) => ({ ...record }));
  }

  // Records matching every given filter, ordered by id. Callers get copies.
  list(filter: RecordFilter = {}): RecordItem[] {
    const q = filter.q?.toLowerCase();
    return this.#records
      .filter((record) => !filter.status || record.status === filter.status)
      .filter((record) => !filter.owner || record.owner === filter.owner)
      .filter((record) => !q || record.title.toLowerCase().includes(q))
      .sort((a, b) => a.id - b.id)
      .map((record) => ({ ...record }));
  }
}

export type RecordStatus = 'active' | 'archived';

export type RecordItem = {
  id: number;
  tenantId: string;
  title: string;
  owner: string;
  status: RecordStatus;
  createdAt: string;
};

export type RecordFilter = {
  tenantId?: string;
  status?: RecordStatus;
  owner?: string;
  q?: string;
};

export class RecordStore {
  #records: RecordItem[];

  constructor(seed: readonly RecordItem[] = []) {
    this.#records = seed.map((record) => ({ ...record }));
  }

  // Records matching every given filter, ordered by id. A filter field that is
  // not set does not restrict the result. Callers get copies.
  list(filter: RecordFilter = {}): RecordItem[] {
    const q = filter.q?.toLowerCase();
    return this.#records
      .filter((record) => !filter.tenantId || record.tenantId === filter.tenantId)
      .filter((record) => !filter.status || record.status === filter.status)
      .filter((record) => !filter.owner || record.owner === filter.owner)
      .filter((record) => !q || record.title.toLowerCase().includes(q))
      .sort((a, b) => a.id - b.id)
      .map((record) => ({ ...record }));
  }
}

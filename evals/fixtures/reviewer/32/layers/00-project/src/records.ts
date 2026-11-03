export type RecordStatus = 'active' | 'archived';

export type RecordItem = {
  id: number;
  title: string;
  owner: string;
  status: RecordStatus;
  createdAt: string;
};

// Read access to records in ascending id order, one slice at a time.
export interface RecordSource {
  count(): number;
  page(offset: number, limit: number): RecordItem[];
}

export class MemorySource implements RecordSource {
  #records: RecordItem[];

  constructor(records: readonly RecordItem[]) {
    this.#records = records.map((record) => ({ ...record })).sort((a, b) => a.id - b.id);
  }

  count(): number {
    return this.#records.length;
  }

  page(offset: number, limit: number): RecordItem[] {
    return this.#records.slice(offset, offset + limit).map((record) => ({ ...record }));
  }
}

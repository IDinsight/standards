import { HttpError } from './http.ts';

export type RecordStatus = 'active' | 'archived';
export const STATUSES: readonly string[] = ['active', 'archived'];
export type RecordItem = { id: number; title: string; owner: string; status: RecordStatus; createdAt: string };
export type RecordFilter = { status?: RecordStatus; owner?: string };

export class RecordStore {
  #records: RecordItem[];

  constructor(seed: readonly RecordItem[] = []) {
    this.#records = seed.map((record) => ({ ...record }));
  }

  // Records matching every given filter, ordered by id. Callers get copies.
  list(filter: RecordFilter = {}): RecordItem[] {
    return this.#records
      .filter((r) => (!filter.status || r.status === filter.status) && (!filter.owner || r.owner === filter.owner))
      .sort((a, b) => a.id - b.id)
      .map((r) => ({ ...r }));
  }

  // Adds a record under the next free id and returns a copy.
  add(record: Omit<RecordItem, 'id'>): RecordItem {
    const created = { ...record, id: this.#records.reduce((max, r) => Math.max(max, r.id), 0) + 1 };
    this.#records.push(created);
    return { ...created };
  }
}

// Store filter from query parameters; blank values and other parameters are ignored.
export function parseFilter(query: Record<string, string>): RecordFilter {
  const filter: RecordFilter = {};
  const status = query.status?.trim();
  if (status) {
    if (!STATUSES.includes(status)) throw new HttpError(400, `unknown status: ${status}`);
    filter.status = status as RecordStatus;
  }
  if (query.owner?.trim()) filter.owner = query.owner.trim();
  return filter;
}

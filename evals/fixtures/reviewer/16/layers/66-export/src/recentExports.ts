import type { RecordFilter } from './records/store.ts';

export type RecentExport = { fileName: string; csv: string; createdAt: Date };

// Two exports are the same when the user and the parsed filter are equal.
export function exportKey(userId: number, filter: RecordFilter): string {
  return JSON.stringify([userId, filter.status ?? null, filter.owner ?? null, filter.q ?? null]);
}

// Exports created during the last `windowMs` milliseconds.
export class RecentExports {
  #windowMs: number;
  #entries: Map<string, RecentExport> = new Map();

  constructor(windowMs: number) {
    this.#windowMs = windowMs;
  }

  find(key: string, now: Date): RecentExport | undefined {
    const entry = this.#entries.get(key);
    return entry && this.#current(entry, now) ? entry : undefined;
  }

  remember(key: string, entry: RecentExport): void {
    for (const [other, earlier] of this.#entries) {
      if (!this.#current(earlier, entry.createdAt)) this.#entries.delete(other);
    }
    this.#entries.set(key, entry);
  }

  #current(entry: RecentExport, now: Date): boolean {
    return now.getTime() - entry.createdAt.getTime() < this.#windowMs;
  }
}

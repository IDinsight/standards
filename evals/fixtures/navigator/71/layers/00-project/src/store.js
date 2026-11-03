export class EntryStore {
  constructor() {
    this.entries = new Map();
    this.dailyTotals = new Map();
    this.nextId = 1;
  }

  save(entry) {
    const id = this.nextId++;
    const saved = { id, ...entry };
    this.entries.set(id, saved);
    const total = this.dailyTotals.get(entry.date) ?? 0;
    this.dailyTotals.set(entry.date, total + entry.hours);
    return saved;
  }

  totalFor(date) {
    return this.dailyTotals.get(date) ?? 0;
  }
}

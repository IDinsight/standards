export class Ledger {
  constructor() {
    this.entries = [];
  }

  add(entry) {
    if (!entry || typeof entry.category !== 'string' || entry.category === '') {
      throw new TypeError('entry needs a category');
    }
    if (!Number.isInteger(entry.amount)) {
      throw new TypeError('amount must be an integer number of cents');
    }
    this.entries.push({ category: entry.category, amount: entry.amount, at: entry.at ?? Date.now() });
  }

  all() {
    return this.entries;
  }
}

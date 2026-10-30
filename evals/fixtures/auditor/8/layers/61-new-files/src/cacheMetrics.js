import { InvoiceCache } from './cache.js';

export class MeteredInvoiceCache extends InvoiceCache {
  constructor(options) {
    super(options);
    this.hits = 0;
    this.misses = 0;
  }

  get(id) {
    const value = super.get(id);
    if (value === undefined) this.misses += 1;
    else this.hits += 1;
    return value;
  }

  stats() {
    const lookups = this.hits + this.misses;
    return { hits: this.hits, misses: this.misses, hitRate: lookups ? this.hits / lookups : 0 };
  }
}

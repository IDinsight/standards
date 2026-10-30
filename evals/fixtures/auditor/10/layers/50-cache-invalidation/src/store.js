import { Cache } from './cache.js';

export class ProductStore {
  constructor({ cacheLimit = 500 } = {}) {
    this.rows = new Map();
    this.cache = new Cache(cacheLimit);
  }

  get(sku) {
    const cached = this.cache.get(sku);
    if (cached) return { ...cached };
    const row = this.rows.get(sku);
    if (!row) return null;
    this.cache.set(sku, row);
    return { ...row };
  }

  put(product) {
    const row = { sku: product.sku, name: product.name, price: product.price };
    this.rows.set(row.sku, row);
    this.cache.delete(row.sku);
    return { ...row };
  }

  remove(sku) {
    const existed = this.rows.delete(sku);
    this.cache.delete(sku);
    return existed;
  }

  invalidate() {
    this.cache.clear();
  }

  list() {
    return [...this.rows.values()]
      .map((row) => ({ ...row }))
      .sort((a, b) => a.sku.localeCompare(b.sku));
  }
}

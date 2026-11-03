import { TtlCache } from './cache.js';

export class Catalog {
  constructor({ cache = new TtlCache() } = {}) {
    this.cache = cache;
    this.products = new Map();
  }

  upsert(product) {
    this.products.set(product.sku, { ...product });
    this.cache.delete(`product:${product.sku}`);
    this.cache.invalidatePrefix('list:');
  }

  get(sku) {
    const key = `product:${sku}`;
    const cached = this.cache.get(key);
    if (cached !== undefined) return cached;
    const product = this.products.get(sku) ?? null;
    this.cache.set(key, product);
    return product;
  }

  list() {
    const cached = this.cache.get('list:all');
    if (cached !== undefined) return cached;
    const products = [...this.products.values()].sort((a, b) => a.sku.localeCompare(b.sku));
    this.cache.set('list:all', products);
    return products;
  }
}

import { RateCache } from './cache.js';

export class RatesClient {
  constructor({ fetchRate, ttlSeconds, maxEntries, now } = {}) {
    if (typeof fetchRate !== 'function') throw new TypeError('fetchRate must be a function');
    this.fetchRate = fetchRate;
    this.cache = new RateCache({ ttlSeconds, maxEntries, now });
  }

  async getRate(base, quote) {
    const from = base.toUpperCase();
    const to = quote.toUpperCase();
    const key = from + '/' + to;
    const cached = this.cache.get(key);
    if (cached !== undefined) return cached;
    const rate = await this.fetchRate(from, to);
    this.cache.set(key, rate);
    return rate;
  }

  clearCache() {
    this.cache.clear();
  }
}

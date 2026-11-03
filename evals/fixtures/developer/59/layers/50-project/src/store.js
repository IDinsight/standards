import { normalizeTag, parseTags } from './tags.js';

export class TagStore {
  constructor() {
    this.byItem = new Map();
  }

  add(itemId, input) {
    const current = this.byItem.get(itemId) ?? new Set();
    for (const tag of parseTags(input)) current.add(tag);
    this.byItem.set(itemId, current);
    return [...current].sort();
  }

  tagsFor(itemId) {
    return [...(this.byItem.get(itemId) ?? [])].sort();
  }

  itemsTagged(name) {
    const wanted = normalizeTag(name);
    const items = [];
    for (const [itemId, tags] of this.byItem) {
      if (tags.has(wanted)) items.push(itemId);
    }
    return items.sort();
  }
}

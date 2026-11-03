import { readRecord } from './records.js';

export function summarize(dir, ids) {
  const items = ids.map((id) => readRecord(dir, id));
  const total = items.reduce((sum, item) => sum + item.quantity, 0);
  return { count: items.length, total };
}

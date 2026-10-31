import { formatCsv } from './csv.js';

export const COLUMNS = ['sku', 'name', 'quantity', 'updatedAt'];

export function exportItems(items) {
  return formatCsv(COLUMNS, items);
}

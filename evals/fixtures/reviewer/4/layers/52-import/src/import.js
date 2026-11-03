import { parseCsv } from './csv.js';
import { STATUSES } from './store.js';

const COLUMNS = ['id', 'title', 'owner', 'status'];

// Adds the records in CSV text to the store. The first row must be the header
// id,title,owner,status. Every row is checked before any record is added, so a
// file with an error changes nothing. Returns the number of records added.
export function importRecords(store, text) {
  const [header, ...rows] = parseCsv(text);
  if (!header || header.join(',') !== COLUMNS.join(',')) {
    throw new Error(`expected the header row ${COLUMNS.join(',')}`);
  }
  const records = rows.map((cells, index) => {
    const row = index + 2;
    if (cells.length !== COLUMNS.length) {
      throw new Error(`row ${row}: expected ${COLUMNS.length} fields, found ${cells.length}`);
    }
    const [id, title, owner, status] = cells;
    if (!/^\d+$/.test(id)) throw new Error(`row ${row}: id must be a whole number`);
    if (!STATUSES.includes(status)) throw new Error(`row ${row}: unknown status ${status}`);
    return { id: Number(id), title, owner, status };
  });
  for (const record of records) store.add(record);
  return records.length;
}

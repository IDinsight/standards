import { literal } from '@records/db';

const STATUSES = ['active', 'archived'];

// Columns of a record as listing and export read them; created_at comes back
// as ISO 8601 in UTC.
const COLUMNS_SQL = `id, title, owner, status, to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS created_at`;

// WHERE clause for the listing filters. All given filters must match; values
// are trimmed, blank values are ignored, and an unknown status is rejected.
export function filterClause(filter) {
  const given = filter ?? {};
  const conditions = [];
  const status = given.status?.trim();
  if (status) {
    if (!STATUSES.includes(status)) throw new RangeError(`unknown status: ${status}`);
    conditions.push(`status = ${literal(status)}`);
  }
  const owner = given.owner?.trim();
  if (owner) conditions.push(`owner = ${literal(owner)}`);
  const q = given.q?.trim();
  if (q) conditions.push(`title ILIKE ${literal(`%${q.replace(/[\\%_]/g, '\\$&')}%`)}`);
  return conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
}

export function selectRecordsSql(filter) {
  return ['SELECT', COLUMNS_SQL, 'FROM records', filterClause(filter), 'ORDER BY id'].filter(Boolean).join(' ');
}

export function toRecord(row) {
  return { id: Number(row.id), title: row.title, owner: row.owner, status: row.status, createdAt: row.created_at };
}

// Records matching the filter, ordered by id.
export async function listRecords(db, filter) {
  const { rows } = await db.query(selectRecordsSql(filter));
  return rows.map(toRecord);
}

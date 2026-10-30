// Stand-in for the database client in unit tests. execute() records each
// statement and returns the next queued result, or an empty one; a queued
// Error is thrown instead. transaction(work) runs work with this same object
// and records 'begin', then 'commit' or 'rollback'. It does not interpret SQL.
const EMPTY = { rows: [], changes: 0, lastInsertRowid: null };

export function fakeDb(results = []) {
  const queue = [...results];
  const db = {
    statements: [],
    events: [],
    async execute(sql, args = []) {
      db.statements.push({ sql, args });
      const next = queue.shift() ?? EMPTY;
      if (next instanceof Error) throw next;
      return next;
    },
    async transaction(work) {
      db.events.push('begin');
      try {
        const value = await work(db);
        db.events.push('commit');
        return value;
      } catch (error) {
        db.events.push('rollback');
        throw error;
      }
    },
  };
  return db;
}

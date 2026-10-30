// Client for a libSQL server (sqld) over its HTTP pipeline API (Hrana over
// HTTP, version 2). Written by hand so the service needs no npm packages.
//
// Statements run on server-side streams. execute() opens a stream, runs one
// statement, and closes the stream. transaction() keeps one stream for the
// whole transaction by sending back the baton from each response, so BEGIN,
// the work, and COMMIT or ROLLBACK run on the same connection.

export const DEFAULT_URL = 'http://127.0.0.1:8080';

export class DatabaseError extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = 'DatabaseError';
  }
}

function encode(value) {
  if (value === null || value === undefined) return { type: 'null' };
  if (Number.isInteger(value)) return { type: 'integer', value: String(value) };
  if (typeof value === 'number') return { type: 'float', value };
  return { type: 'text', value: String(value) };
}

function decode(value) {
  switch (value.type) {
    case 'null': return null;
    case 'integer': return Number(value.value);
    case 'blob': return Buffer.from(value.base64, 'base64');
    default: return value.value;
  }
}

class Stream {
  #url;
  #baton = null;

  constructor(url) {
    this.#url = url;
  }

  async #pipeline(requests) {
    let response;
    try {
      response = await fetch(new URL('/v2/pipeline', this.#url), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ baton: this.#baton, requests }),
      });
    } catch (error) {
      throw new DatabaseError(`cannot reach libSQL server at ${this.#url} (${error.cause?.code ?? error.message})`, { cause: error });
    }
    if (!response.ok) {
      throw new DatabaseError(`libSQL server answered ${response.status}: ${await response.text()}`);
    }
    const body = await response.json();
    this.#baton = body.baton;
    if (body.base_url) this.#url = body.base_url;
    return body.results;
  }

  async execute(sql, args = []) {
    const [result] = await this.#pipeline([
      { type: 'execute', stmt: { sql, args: args.map(encode), want_rows: true } },
    ]);
    if (result.type === 'error') throw new DatabaseError(result.error.message);
    const { cols, rows, affected_row_count: changes, last_insert_rowid: rowid } = result.response.result;
    return {
      rows: rows.map((row) => Object.fromEntries(row.map((value, index) => [cols[index].name, decode(value)]))),
      changes,
      lastInsertRowid: rowid === null || rowid === undefined ? null : Number(rowid),
    };
  }

  // Closing a stream also discards any transaction still open on it.
  async close() {
    if (this.#baton === null) return;
    try {
      await this.#pipeline([{ type: 'close' }]);
    } catch {
      // The server drops streams that are not used again.
    }
    this.#baton = null;
  }
}

export function connect(url = process.env.LIBSQL_URL ?? DEFAULT_URL) {
  return {
    url,

    async execute(sql, args) {
      const stream = new Stream(url);
      try {
        return await stream.execute(sql, args);
      } finally {
        await stream.close();
      }
    },

    // Runs work(tx) between BEGIN IMMEDIATE and COMMIT. If work throws, the
    // transaction is rolled back and the error is rethrown.
    async transaction(work) {
      const stream = new Stream(url);
      try {
        await stream.execute('BEGIN IMMEDIATE');
        let value;
        try {
          value = await work({ execute: (sql, args) => stream.execute(sql, args) });
        } catch (error) {
          await stream.execute('ROLLBACK').catch(() => {});
          throw error;
        }
        await stream.execute('COMMIT');
        return value;
      } finally {
        await stream.close();
      }
    },
  };
}

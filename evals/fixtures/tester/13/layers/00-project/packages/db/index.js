// Small PostgreSQL client for the records service: connection startup with
// trust, cleartext password, or md5 authentication, and the simple query
// protocol. Result values arrive as text (or null); callers convert them.
import { createHash } from 'node:crypto';
import net from 'node:net';

export class DatabaseError extends Error {
  constructor(fields) {
    super(fields.M ?? 'database error');
    this.name = 'DatabaseError';
    this.code = fields.C;
    this.severity = fields.S;
    this.detail = fields.D;
  }
}

const NUL = Buffer.from([0]);

function cstring(text) {
  return Buffer.concat([Buffer.from(text, 'utf8'), NUL]);
}

function frame(type, body) {
  const header = Buffer.alloc(5);
  header.write(type, 0, 'ascii');
  header.writeInt32BE(body.length + 4, 1);
  return Buffer.concat([header, body]);
}

function startupMessage({ user, database }) {
  const params = Buffer.concat([
    cstring('user'), cstring(user),
    cstring('database'), cstring(database),
    cstring('client_encoding'), cstring('UTF8'),
    NUL,
  ]);
  const header = Buffer.alloc(8);
  header.writeInt32BE(params.length + 8, 0);
  header.writeInt32BE(196608, 4); // protocol version 3.0
  return Buffer.concat([header, params]);
}

function md5(data) {
  return createHash('md5').update(data).digest('hex');
}

// Sequential reads from a message body.
function reader(body) {
  let offset = 0;
  return {
    int16() {
      const value = body.readInt16BE(offset);
      offset += 2;
      return value;
    },
    int32() {
      const value = body.readInt32BE(offset);
      offset += 4;
      return value;
    },
    bytes(length) {
      const value = body.subarray(offset, offset + length);
      offset += length;
      return value;
    },
    string() {
      const end = body.indexOf(0, offset);
      const text = body.toString('utf8', offset, end);
      offset = end + 1;
      return text;
    },
    skip(length) {
      offset += length;
    },
    atEnd() {
      return offset >= body.length || body[offset] === 0;
    },
  };
}

// postgres://user:password@host:port/database
export function parseUrl(url) {
  const parsed = new URL(url);
  const user = decodeURIComponent(parsed.username);
  return {
    host: parsed.hostname || '127.0.0.1',
    port: Number(parsed.port || 5432),
    user,
    password: decodeURIComponent(parsed.password),
    database: decodeURIComponent(parsed.pathname.slice(1)) || user,
  };
}

export class Client {
  #config;
  #socket = null;
  #buffer = Buffer.alloc(0);
  #pending = null;
  #ready = false;

  constructor(config) {
    this.#config = config;
  }

  // Connects and authenticates; resolves with the client once the server is
  // ready for queries.
  open() {
    return new Promise((resolve, reject) => {
      this.#pending = { resolve, reject, error: null };
      const socket = net.connect(this.#config.port, this.#config.host);
      this.#socket = socket;
      socket.on('connect', () => socket.write(startupMessage(this.#config)));
      socket.on('data', (chunk) => this.#receive(chunk));
      socket.on('error', (error) => this.#settle(error));
      socket.on('close', () => this.#settle(new Error('connection closed')));
    });
  }

  // Runs one simple-protocol query, which may hold several statements, and
  // resolves with the column names and rows of the last result set and the
  // command tag. A server error rejects with DatabaseError once the server is
  // ready again, so the connection stays usable.
  query(sql) {
    if (!this.#ready || this.#socket.destroyed) return Promise.reject(new Error('client is not connected'));
    if (this.#pending) return Promise.reject(new Error('a query is already running on this client'));
    return new Promise((resolve, reject) => {
      this.#pending = { resolve, reject, error: null, fields: [], rows: [], command: null };
      this.#socket.write(frame('Q', cstring(sql)));
    });
  }

  end() {
    if (!this.#socket || this.#socket.destroyed) return Promise.resolve();
    return new Promise((resolve) => {
      this.#socket.once('close', () => resolve());
      this.#socket.end(frame('X', Buffer.alloc(0)));
    });
  }

  #settle(error, result) {
    const pending = this.#pending;
    if (!pending) return;
    this.#pending = null;
    if (error) pending.reject(error);
    else pending.resolve(result);
  }

  #receive(chunk) {
    this.#buffer = Buffer.concat([this.#buffer, chunk]);
    while (this.#buffer.length >= 5) {
      const length = this.#buffer.readInt32BE(1);
      if (this.#buffer.length < length + 1) return;
      const type = String.fromCharCode(this.#buffer[0]);
      const body = this.#buffer.subarray(5, length + 1);
      this.#buffer = this.#buffer.subarray(length + 1);
      this.#handle(type, body);
    }
  }

  #authenticate(read) {
    const method = read.int32();
    const { user, password } = this.#config;
    if (method === 0) return; // AuthenticationOk
    if (method === 3) {
      this.#socket.write(frame('p', cstring(password)));
    } else if (method === 5) {
      const salt = read.bytes(4);
      const hashed = md5(Buffer.concat([Buffer.from(md5(password + user)), salt]));
      this.#socket.write(frame('p', cstring(`md5${hashed}`)));
    } else {
      this.#settle(new Error(`unsupported authentication method ${method}; use trust, password, or md5 authentication`));
      this.#socket.destroy();
    }
  }

  #handle(type, body) {
    const read = reader(body);
    const pending = this.#pending;
    switch (type) {
      case 'R':
        this.#authenticate(read);
        break;
      case 'E': {
        const fields = {};
        while (!read.atEnd()) {
          const code = String.fromCharCode(read.bytes(1)[0]);
          fields[code] = read.string();
        }
        const error = new DatabaseError(fields);
        if (!this.#ready) {
          this.#settle(error);
          this.#socket.destroy();
        } else if (pending) {
          pending.error ??= error;
        }
        break;
      }
      case 'T':
        if (pending) {
          const count = read.int16();
          pending.fields = [];
          pending.rows = [];
          for (let index = 0; index < count; index += 1) {
            pending.fields.push(read.string());
            read.skip(18);
          }
        }
        break;
      case 'D':
        if (pending) {
          const count = read.int16();
          const row = {};
          for (let index = 0; index < count; index += 1) {
            const length = read.int32();
            row[pending.fields[index]] = length === -1 ? null : read.bytes(length).toString('utf8');
          }
          pending.rows.push(row);
        }
        break;
      case 'C':
        if (pending) pending.command = read.string();
        break;
      case 'Z':
        if (!this.#ready) {
          this.#ready = true;
          this.#settle(null, this);
        } else if (pending) {
          if (pending.error) this.#settle(pending.error);
          else this.#settle(null, { fields: pending.fields, rows: pending.rows, command: pending.command });
        }
        break;
      default:
        // ParameterStatus, BackendKeyData, NoticeResponse, EmptyQueryResponse.
        break;
    }
  }
}

export function connect(url) {
  return new Client(parseUrl(url)).open();
}

// SQL literal for a value: NULL, a number, or a quoted string with single
// quotes doubled (E'' form with backslashes doubled when it has any).
export function literal(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new RangeError(`cannot write ${value} as a SQL literal`);
    return String(value);
  }
  const text = String(value).replaceAll("'", "''");
  return text.includes('\\') ? `E'${text.replaceAll('\\', '\\\\')}'` : `'${text}'`;
}

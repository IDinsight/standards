import assert from 'node:assert/strict';
import net from 'node:net';
import { after, before, test } from 'node:test';

import { connect, literal } from '../index.js';

// In-process stand-in for a PostgreSQL server: accepts any startup with
// trust authentication and answers a fixed set of simple queries.
function int32(value) {
  const buffer = Buffer.alloc(4);
  buffer.writeInt32BE(value);
  return buffer;
}

function int16(value) {
  const buffer = Buffer.alloc(2);
  buffer.writeInt16BE(value);
  return buffer;
}

const cstr = (text) => Buffer.concat([Buffer.from(text), Buffer.from([0])]);

function frame(type, body = Buffer.alloc(0)) {
  return Buffer.concat([Buffer.from(type), int32(body.length + 4), body]);
}

function rowDescription(names) {
  return frame('T', Buffer.concat([int16(names.length), ...names.map((name) => Buffer.concat([cstr(name), Buffer.alloc(18)]))]));
}

function dataRow(values) {
  const cells = values.map((value) => (value === null ? int32(-1) : Buffer.concat([int32(Buffer.byteLength(value)), Buffer.from(value)])));
  return frame('D', Buffer.concat([int16(values.length), ...cells]));
}

const readyForQuery = frame('Z', Buffer.from('I'));

function reply(sql) {
  if (sql === 'SELECT id, title FROM records ORDER BY id') {
    return [rowDescription(['id', 'title']), dataRow(['1', 'Lease agreement, Building B']), dataRow(['2', null]), frame('C', cstr('SELECT 2'))];
  }
  return [frame('E', Buffer.concat([cstr('SERROR'), cstr('C42601'), cstr(`Msyntax error at or near "${sql.split(' ')[0]}"`), Buffer.from([0])]))];
}

let server;
let url;

before(async () => {
  server = net.createServer((socket) => {
    let buffer = Buffer.alloc(0);
    let started = false;
    socket.on('data', (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      for (;;) {
        if (!started) {
          if (buffer.length < 4 || buffer.length < buffer.readInt32BE(0)) return;
          buffer = buffer.subarray(buffer.readInt32BE(0));
          started = true;
          socket.write(Buffer.concat([frame('R', int32(0)), frame('S', Buffer.concat([cstr('server_version'), cstr('16.4')])), readyForQuery]));
          continue;
        }
        if (buffer.length < 5 || buffer.length < buffer.readInt32BE(1) + 1) return;
        const type = String.fromCharCode(buffer[0]);
        const body = buffer.subarray(5, buffer.readInt32BE(1) + 1);
        buffer = buffer.subarray(buffer.readInt32BE(1) + 1);
        if (type === 'X') {
          socket.end();
          return;
        }
        if (type === 'Q') socket.write(Buffer.concat([...reply(body.toString('utf8', 0, body.length - 1)), readyForQuery]));
      }
    });
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  url = `postgres://records@127.0.0.1:${server.address().port}/records_test`;
});

after(() => new Promise((resolve) => server.close(resolve)));

test('query resolves with rows keyed by column name', async () => {
  const db = await connect(url);
  try {
    const result = await db.query('SELECT id, title FROM records ORDER BY id');
    assert.deepEqual(result.rows, [{ id: '1', title: 'Lease agreement, Building B' }, { id: '2', title: null }]);
    assert.equal(result.command, 'SELECT 2');
  } finally {
    await db.end();
  }
});

test('a server error rejects the query and the connection stays usable', async () => {
  const db = await connect(url);
  try {
    await assert.rejects(db.query('SELEC id FROM records'), { name: 'DatabaseError', code: '42601' });
    assert.equal((await db.query('SELECT id, title FROM records ORDER BY id')).rows.length, 2);
  } finally {
    await db.end();
  }
});

test('literal writes NULL, numbers, and quoted strings', () => {
  assert.equal(literal(null), 'NULL');
  assert.equal(literal(7), '7');
  assert.equal(literal("O'Neil"), "'O''Neil'");
  assert.equal(literal(String.raw`C:\exports`), String.raw`E'C:\\exports'`);
});

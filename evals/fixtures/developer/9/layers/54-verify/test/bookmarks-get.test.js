import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { createBookmarkRoutes } from '../src/routes/bookmarks.js';
import { createStore } from '../src/store.js';

const saved = [
  { id: 1, url: 'https://nodejs.org', title: 'Node.js', tags: ['js'] },
  { id: 2, url: 'https://www.python.org', title: 'Python', tags: [] },
];

function seededRoutes() {
  const dir = mkdtempSync(path.join(tmpdir(), 'bookmarks-get-'));
  const file = path.join(dir, 'bookmarks.json');
  writeFileSync(file, JSON.stringify({ nextId: 3, items: saved }));
  return createBookmarkRoutes({ store: createStore(file), logger: { error() {} } });
}

test('GET returns a stored bookmark', () => {
  assert.deepEqual(seededRoutes().get('2'), { status: 200, body: saved[1] });
});

test('GET returns 404 for an unknown id', () => {
  assert.deepEqual(seededRoutes().get('9'), { status: 404, body: { error: 'not_found' } });
});

test('GET returns 404 for a non-numeric id', () => {
  const routes = seededRoutes();
  for (const raw of ['abc', '0', '1.5', '']) {
    assert.deepEqual(routes.get(raw), { status: 404, body: { error: 'not_found' } });
  }
});

test('GET returns 500 internal_error when the store fails', () => {
  const logged = [];
  const routes = createBookmarkRoutes({
    store: { getById() { throw new Error("EACCES: permission denied, open '/srv/bookmarks/data.json'"); } },
    logger: { error: (...args) => logged.push(args) },
  });
  const response = routes.get('7');
  assert.equal(response.status, 500);
  assert.equal(response.body.error, 'internal_error');
  assert.equal(logged.length, 1);
});

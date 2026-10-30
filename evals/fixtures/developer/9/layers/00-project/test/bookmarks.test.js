import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { createBookmarkRoutes } from '../src/routes/bookmarks.js';
import { createStore } from '../src/store.js';

function freshRoutes() {
  const dir = mkdtempSync(path.join(tmpdir(), 'bookmarks-'));
  const file = path.join(dir, 'bookmarks.json');
  writeFileSync(file, JSON.stringify({ nextId: 1, items: [] }));
  return createBookmarkRoutes({ store: createStore(file) });
}

test('create then list returns the new bookmark', () => {
  const routes = freshRoutes();
  const created = routes.create({ url: 'https://nodejs.org', title: 'Node.js', tags: ['js'] });
  assert.equal(created.status, 201);
  assert.deepEqual(created.body, { id: 1, url: 'https://nodejs.org', title: 'Node.js', tags: ['js'] });
  assert.deepEqual(routes.list(), { status: 200, body: [created.body] });
});

test('create rejects a bookmark without a title', () => {
  const routes = freshRoutes();
  const response = routes.create({ url: 'https://example.com', title: '  ' });
  assert.equal(response.status, 400);
  assert.equal(response.body.error, 'invalid_bookmark');
  assert.deepEqual(response.body.problems, ['title is required']);
  assert.deepEqual(routes.list().body, []);
});

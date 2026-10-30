import assert from 'node:assert/strict';
import test from 'node:test';

import { route } from '../src/routes.js';
import { RecordStore } from '../src/store.js';

test('creates and reads a record', () => {
  const store = new RecordStore();
  const created = route(store, 'POST', '/records', { title: '  Q3 report ', body: 'draft' });
  assert.equal(created.status, 201);
  assert.equal(created.body.title, 'Q3 report');
  const read = route(store, 'GET', '/records/' + created.body.id);
  assert.equal(read.status, 200);
  assert.equal(read.body.title, 'Q3 report');
  assert.equal(read.body.body, 'draft');
});

test('rejects a record without a title', () => {
  const store = new RecordStore();
  const response = route(store, 'POST', '/records', { title: '   ' });
  assert.equal(response.status, 400);
  assert.equal(route(store, 'GET', '/records').body.length, 0);
});

test('searches the list by title', () => {
  const store = new RecordStore();
  route(store, 'POST', '/records', { title: 'Budget 2027' });
  route(store, 'POST', '/records', { title: 'Roadmap' });
  assert.equal(route(store, 'GET', '/records').body.length, 2);
  const found = route(store, 'GET', '/records', undefined, { q: 'BUD' });
  assert.deepEqual(found.body.map((record) => record.title), ['Budget 2027']);
});

test('updates a record', () => {
  const store = new RecordStore();
  const { body: record } = route(store, 'POST', '/records', { title: 'Old' });
  const updated = route(store, 'PATCH', '/records/' + record.id, { title: 'New' });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.title, 'New');
  assert.equal(route(store, 'PATCH', '/records/42', { title: 'x' }).status, 404);
});

test('deletes a record', () => {
  const store = new RecordStore();
  const { body: record } = route(store, 'POST', '/records', { title: 'Temp' });
  assert.equal(route(store, 'DELETE', '/records/' + record.id).status, 204);
  assert.equal(route(store, 'GET', '/records/' + record.id).status, 404);
  assert.equal(route(store, 'DELETE', '/records/' + record.id).status, 404);
});

import assert from 'node:assert/strict';
import test from 'node:test';

import { Directory } from '../src/directory.js';

const ada = { id: 'c1', name: 'Ada Lovelace', email: 'ada@example.org' };
const alan = { id: 'c2', name: 'Alan Turing', email: 'alan.turing@example.org' };

test('add and get a contact', () => {
  const directory = new Directory().add(ada);
  assert.deepEqual(directory.get('c1'), ada);
  assert.equal(directory.get('missing'), null);
});

test('list returns contacts sorted by name', () => {
  const directory = new Directory().add(alan).add(ada);
  assert.deepEqual(directory.list().map((contact) => contact.id), ['c1', 'c2']);
});

test('remove deletes a contact', () => {
  const directory = new Directory().add(ada);
  assert.equal(directory.remove('c1'), true);
  assert.equal(directory.size, 0);
});

test('add requires an id', () => {
  assert.throws(() => new Directory().add({ name: 'No Id' }), /id is required/);
});

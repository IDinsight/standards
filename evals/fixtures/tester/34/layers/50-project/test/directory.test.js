import assert from 'node:assert/strict';
import test from 'node:test';

import { createDirectory } from '../src/directory.js';
import { loadFixture } from './helpers.js';

test('lists contacts in insertion order', () => {
  const directory = createDirectory(loadFixture('contacts-sample.json'));
  assert.deepEqual(directory.list().map((contact) => contact.name), ['Ada Lovelace', 'Grace Hopper', 'Alan Turing']);
});

test('returns null for an unknown id', () => {
  const directory = createDirectory(loadFixture('contacts-sample.json'));
  assert.equal(directory.get(99), null);
});

test('rejects duplicate ids', () => {
  assert.throws(() => createDirectory([
    { id: 1, name: 'Ada Lovelace', email: 'ada@example.org' },
    { id: 1, name: 'Grace Hopper', email: 'grace@example.org' },
  ]), /duplicate contact id 1/);
});

test('stores email addresses in lowercase', () => {
  const directory = createDirectory(loadFixture('contacts-sample.json'));
  assert.equal(directory.get(2).email, 'grace.hopper@navy.example');
});

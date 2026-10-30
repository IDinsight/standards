import assert from 'node:assert/strict';
import test from 'node:test';

import { createDirectory } from '../src/directory.js';
import { searchContacts } from '../src/search.js';
import { loadFixture } from './helpers.js';

const names = (contacts) => contacts.map((contact) => contact.name);

test('matches a name fragment regardless of case', () => {
  const directory = createDirectory(loadFixture('contacts.json'));
  assert.deepEqual(names(searchContacts(directory, 'ADA')), ['Ada Lovelace', 'Adaeze Okafor']);
});

test('matches the fragment anywhere in the name', () => {
  const directory = createDirectory(loadFixture('contacts-sample.json'));
  assert.deepEqual(names(searchContacts(directory, 'son')), ['Katherine Johnson', 'Mary Jackson']);
});

test('returns an empty list when no name matches', () => {
  const directory = createDirectory(loadFixture('contacts.json'));
  assert.deepEqual(searchContacts(directory, 'zzz'), []);
});

test('returns no contacts for a blank or whitespace-only query', () => {
  const directory = createDirectory(loadFixture('contacts.json'));
  assert.deepEqual(searchContacts(directory, ''), []);
  assert.deepEqual(searchContacts(directory, '   '), []);
});

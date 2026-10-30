import assert from 'node:assert/strict';
import test from 'node:test';

import { createDirectory } from '../src/directory.js';
import { formatContact } from '../src/format.js';
import { loadFixture } from './helpers.js';

test('formats a contact as name and address', () => {
  const [first] = createDirectory(loadFixture('contacts.json')).list();
  assert.equal(formatContact(first), 'Ada Lovelace <ada@analytical.example>');
});

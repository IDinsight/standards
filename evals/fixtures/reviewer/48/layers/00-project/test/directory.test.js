import assert from 'node:assert/strict';
import test from 'node:test';

import { createDirectory } from '../src/directory.js';

test('finds an office by code regardless of case and spacing', () => {
  const directory = createDirectory();
  assert.equal(directory.find(' nbo ').name, 'Nairobi office');
});

test('returns null for an unknown code', () => {
  assert.equal(createDirectory().find('XYZ'), null);
});

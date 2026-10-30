import assert from 'node:assert/strict';
import { test } from 'node:test';

import { fetchRecords, filterQuery } from '../src/api.js';

test('filterQuery keeps only filters with a value', () => {
  assert.equal(filterQuery({ status: 'active', owner: '' }), '?status=active');
  assert.equal(filterQuery({ status: '' }), '');
});

test('fetchRecords requests the filtered list and returns its records', async () => {
  const requested = [];
  const fakeFetch = async (url) => {
    requested.push(url);
    return { ok: true, status: 200, json: async () => ({ count: 1, records: [{ id: 4 }] }) };
  };
  assert.deepEqual(await fetchRecords({ status: 'archived' }, fakeFetch), [{ id: 4 }]);
  assert.deepEqual(requested, ['/api/records?status=archived']);
});

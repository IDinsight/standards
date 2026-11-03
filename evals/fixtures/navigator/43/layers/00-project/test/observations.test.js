import assert from 'node:assert/strict';
import test from 'node:test';

import { listObservations, recordObservation } from '../src/app.js';
import { createClient } from '../src/client.js';
import { ObservationStore, validate } from '../src/observations.js';

function fakeFetch(status) {
  const calls = [];
  const fetchImpl = async (url, options) => {
    const body = JSON.parse(options.body);
    calls.push({ url, body });
    return { status, json: async () => ({ id: 41, ...body }) };
  };
  return { calls, fetchImpl };
}

test('records an observation confirmed by the server', async () => {
  const { calls, fetchImpl } = fakeFetch(201);
  const store = new ObservationStore();
  const client = createClient({ serverUrl: 'https://survey.example.org', fetchImpl });
  const saved = await recordObservation({ store, client }, { site: ' North Marsh ', species: 'Curlew', count: 3 });
  assert.equal(saved.id, 41);
  assert.equal(saved.site, 'North Marsh');
  assert.equal(calls[0].url, 'https://survey.example.org/api/observations');
  assert.deepEqual(listObservations({ store }), [saved]);
});

test('does not store an observation the server rejects', async () => {
  const { fetchImpl } = fakeFetch(503);
  const store = new ObservationStore();
  const client = createClient({ serverUrl: 'https://survey.example.org', fetchImpl });
  await assert.rejects(
    recordObservation({ store, client }, { site: 'North Marsh', species: 'Curlew', count: 3 }),
    /503/,
  );
  assert.equal(listObservations({ store }).length, 0);
});

test('requires site, species, and a whole count', () => {
  assert.throws(() => validate({ site: '', species: 'Curlew', count: 1 }), /required/);
  assert.throws(() => validate({ site: 'North Marsh', species: 'Curlew', count: 1.5 }), /count/);
});

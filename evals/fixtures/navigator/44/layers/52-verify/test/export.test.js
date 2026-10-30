import assert from 'node:assert/strict';
import test from 'node:test';

import { ordersToCsv } from '../src/export.js';
import { listOrders } from '../src/orders.js';
import { route } from '../src/server.js';
import { createStore } from '../src/store.js';

test('GET /orders.csv returns text/csv with a header row', () => {
  const result = route('GET', '/orders.csv', createStore());
  assert.equal(result.status, 200);
  assert.equal(result.type, 'text/csv');
  const lines = result.body.split('\n');
  assert.equal(lines[0], 'id,customer,total,placed_at');
  assert.equal(lines.length, 4);
});

test('rows follow the JSON listing order, newest first', () => {
  const lines = ordersToCsv(listOrders(createStore())).split('\n').slice(1);
  assert.deepEqual(lines.map((line) => line.split(',')[0]), ['1003', '1002', '1001']);
});

test('fields with commas or double quotes are quoted and quotes are doubled', () => {
  const lines = ordersToCsv(listOrders(createStore())).split('\n');
  assert.equal(lines[1], '1003,"North ""Pier"" Café",1204.99,2026-09-05T16:05:00Z');
  assert.ok(lines[2].startsWith('1002,"Lindqvist, Bros.",'));
});

test('fields with line breaks are quoted', () => {
  const csv = ordersToCsv([{ id: 7, customer: 'Dock 4\nRear gate', total: 10, placedAt: '2026-09-06T09:00:00Z' }]);
  assert.ok(csv.includes('7,"Dock 4\nRear gate",'));
});

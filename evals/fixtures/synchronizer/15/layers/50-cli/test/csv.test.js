import assert from 'node:assert/strict';
import { test } from 'node:test';

import { csvField, toCsv } from '../src/csv.js';

test('plain fields are written as they are', () => {
  assert.equal(csvField('Vendor onboarding checklist'), 'Vendor onboarding checklist');
  assert.equal(csvField(7), '7');
  assert.equal(csvField(undefined), '');
});

test('fields containing the delimiter are quoted', () => {
  assert.equal(csvField('Lease agreement, Building B'), '"Lease agreement, Building B"');
  assert.equal(csvField('a;b', ';'), '"a;b"');
  assert.equal(csvField('a,b', ';'), 'a,b');
});

test('double quotes are doubled and line breaks are quoted', () => {
  assert.equal(csvField('Q2 "priority" review'), '"Q2 ""priority"" review"');
  assert.equal(csvField('one\ntwo'), '"one\ntwo"');
});

test('toCsv writes a header and CRLF-terminated rows in column order', () => {
  const rows = [{ id: 1, title: 'A, B', owner: 'li' }, { id: 2, title: 'C', owner: 'dana' }];
  assert.equal(toCsv(rows, ['owner', 'id']), 'owner,id\r\nli,1\r\ndana,2\r\n');
  assert.equal(toCsv(rows, ['id', 'title']), 'id,title\r\n1,"A, B"\r\n2,C\r\n');
});

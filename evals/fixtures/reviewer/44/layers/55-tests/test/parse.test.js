import assert from 'node:assert/strict';
import test from 'node:test';

import { parseDuration, parseLine } from '../src/parse.js';

test('parseDuration converts each duration form to minutes', () => {
  assert.equal(parseDuration('2h'), 120);
  assert.equal(parseDuration('45m'), 45);
  assert.equal(parseDuration('1h05m'), 65);
  assert.equal(parseDuration('90m'), 90);
  assert.equal(parseDuration('0m'), 0);
});

test('parseDuration rejects malformed durations', () => {
  for (const text of ['', 'h', 'm', '1.5h', '30', '1h60m', '-2h', '2h30', 'm30']) {
    assert.equal(parseDuration(text), null, text);
  }
});

test('parseLine reads date, project, and minutes', () => {
  assert.deepEqual(parseLine('2026-09-01 website 1h30m'), { date: '2026-09-01', project: 'website', minutes: 90 });
  assert.deepEqual(parseLine('  2026-09-02\tadmin   45m  '), { date: '2026-09-02', project: 'admin', minutes: 45 });
});

test('parseLine skips blank and comment lines', () => {
  for (const line of ['', '   ', '\t', '# lunch', '   # standup']) {
    assert.deepEqual(parseLine(line), { skip: true }, JSON.stringify(line));
  }
});

test('parseLine rejects lines with the wrong shape', () => {
  for (const line of [
    'website 1h',
    '2026-09-01 website',
    '2026-09-01 web site 1h',
    '09/01/2026 website 1h',
    '2026-09-01 website 1h75m',
    '2026-09-01 website 1h # call',
  ]) {
    assert.equal(parseLine(line), null, line);
  }
});

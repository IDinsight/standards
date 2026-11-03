import assert from 'node:assert/strict';
import test from 'node:test';

import { DEFAULTS, loadConfig } from '../src/config.js';

test('defaults apply when no options are given', () => {
  assert.deepEqual(loadConfig(), { ...DEFAULTS });
});

test('accepts each supported date format', () => {
  for (const dateFormat of ['YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY']) {
    assert.equal(loadConfig({ dateFormat }).dateFormat, dateFormat);
  }
  assert.throws(() => loadConfig({ dateFormat: 'YYYY/MM/DD' }), /dateFormat must be one of/);
});

test('rejects unknown options', () => {
  assert.throws(() => loadConfig({ currancy: 'EUR' }), /Unknown option: currancy/);
});

test('currency must be a three-letter code', () => {
  assert.equal(loadConfig({ currency: 'EUR' }).currency, 'EUR');
  assert.throws(() => loadConfig({ currency: 'euro' }), /currency/);
});

test('roundTo is a whole number from 0 to 4', () => {
  assert.equal(loadConfig({ roundTo: 0 }).roundTo, 0);
  assert.throws(() => loadConfig({ roundTo: 5 }), /roundTo/);
  assert.throws(() => loadConfig({ roundTo: 1.5 }), /roundTo/);
});

test('delimiter accepts comma, semicolon, and tab', () => {
  for (const delimiter of [',', ';', '\t']) assert.equal(loadConfig({ delimiter }).delimiter, delimiter);
  assert.throws(() => loadConfig({ delimiter: '|' }), /delimiter/);
});

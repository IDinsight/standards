import assert from 'node:assert/strict';
import test from 'node:test';

import { loadSettings, parseSettings } from '../src/settings.js';

test('fills in defaults', () => {
  const settings = parseSettings({ perKg: 2 });
  assert.equal(settings.baseRate, 4.5);
  assert.equal(settings.perKg, 2);
  assert.equal(settings.currency, 'EUR');
});

test('rejects a negative per-kilogram rate', () => {
  assert.throws(() => parseSettings({ perKg: -1 }), RangeError);
});

test('loads the bundled settings file', () => {
  const settings = loadSettings(new URL('../config/shipping.json', import.meta.url));
  assert.equal(settings.baseRate, 4.5);
  assert.equal(settings.perKg, 1.2);
});

test('leaves the free-shipping threshold unset by default', () => {
  assert.equal(parseSettings({}).freeShippingThreshold, null);
});

test('rejects a negative free-shipping threshold', () => {
  assert.throws(() => parseSettings({ freeShippingThreshold: -5 }), { name: 'RangeError', message: /freeShippingThreshold/ });
});

test('rejects a non-numeric free-shipping threshold', () => {
  assert.throws(() => parseSettings({ freeShippingThreshold: '50' }), { name: 'RangeError', message: /freeShippingThreshold/ });
});

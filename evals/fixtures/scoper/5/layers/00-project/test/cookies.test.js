import assert from 'node:assert/strict';
import test from 'node:test';

import { parseCookies, sessionCookie } from '../src/cookies.js';

test('session cookie is HttpOnly, Secure, and lasts 12 hours', () => {
  const cookie = sessionCookie('abc');
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /Secure/);
  assert.match(cookie, /Max-Age=43200/);
});

test('parses a Cookie header', () => {
  assert.deepEqual(parseCookies('sid=abc; theme=dark'), { sid: 'abc', theme: 'dark' });
});

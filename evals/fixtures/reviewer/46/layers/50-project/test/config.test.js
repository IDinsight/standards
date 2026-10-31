import assert from 'node:assert/strict';
import test from 'node:test';

import { loadConfig } from '../src/config.js';

test('defaults the archive directory', () => {
  assert.equal(loadConfig({}).archiveDir, './var/archive');
  assert.equal(loadConfig({ ARCHIVE_DIR: '/data/archive' }).archiveDir, '/data/archive');
});

import assert from 'node:assert/strict';
import test from 'node:test';

import { loadCleanupConfig, loadConfig, parseRetentionDays } from '../src/config.js';

test('defaults the archive directory', () => {
  assert.equal(loadConfig({}).archiveDir, './var/archive');
  assert.equal(loadConfig({ ARCHIVE_DIR: '/data/archive' }).archiveDir, '/data/archive');
});

test('defaults retention to 30 days when unset or empty', () => {
  assert.equal(loadCleanupConfig({}).retentionDays, 30);
  assert.equal(loadCleanupConfig({ ARCHIVE_RETENTION_DAYS: '' }).retentionDays, 30);
});

test('reads ARCHIVE_RETENTION_DAYS', () => {
  assert.deepEqual(loadCleanupConfig({ ARCHIVE_DIR: '/data/archive', ARCHIVE_RETENTION_DAYS: '7' }), {
    archiveDir: '/data/archive',
    retentionDays: 7,
  });
  assert.equal(parseRetentionDays('365'), 365);
});

test('rejects zero, negative, and non-integer values', () => {
  for (const value of ['0', '-3', '1.5', 'seven', ' 7']) {
    assert.throws(() => parseRetentionDays(value), /ARCHIVE_RETENTION_DAYS/, value);
  }
});

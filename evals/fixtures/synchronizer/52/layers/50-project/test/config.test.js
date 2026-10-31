import assert from 'node:assert/strict';
import test from 'node:test';

import { parseConfig } from '../src/config.js';

test('reads jobs with integer intervals', () => {
  const jobs = parseConfig(JSON.stringify({ jobs: [{ name: 'backup', command: 'backup.sh', interval: 3600 }] }));
  assert.deepEqual(jobs, [{ name: 'backup', command: 'backup.sh', intervalSeconds: 3600 }]);
});

test('rejects a missing command', () => {
  assert.throws(() => parseConfig(JSON.stringify({ jobs: [{ name: 'x', interval: 5 }] })), /x: "command" is required/);
});

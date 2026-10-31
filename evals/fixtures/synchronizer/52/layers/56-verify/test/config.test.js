import assert from 'node:assert/strict';
import test from 'node:test';

import { parseConfig } from '../src/config.js';

const config = (jobs) => JSON.stringify({ jobs });

test('reads jobs with integer intervals', () => {
  assert.deepEqual(parseConfig(config([{ name: 'backup', command: 'backup.sh', interval: 3600 }])),
    [{ name: 'backup', command: 'backup.sh', intervalSeconds: 3600 }]);
});

test('rejects a missing command', () => {
  assert.throws(() => parseConfig(config([{ name: 'x', interval: 5 }])), /x: "command" is required/);
});

test('accepts hour, minute, and second durations', () => {
  const jobs = parseConfig(config([
    { name: 'a', command: 'a.sh', interval: '1h30m' },
    { name: 'b', command: 'b.sh', interval: '45s' },
    { name: 'c', command: 'c.sh', interval: '2H' },
  ]));
  assert.deepEqual(jobs.map((job) => job.intervalSeconds), [5400, 45, 7200]);
});

test('rejects invalid interval strings with the job name', () => {
  for (const interval of ['1x', '', 'h', '0s', 'soon']) {
    assert.throws(() => parseConfig(config([{ name: 'nightly', command: 'n.sh', interval }])),
      new RegExp(`config: nightly: invalid interval ${JSON.stringify(interval)}`));
  }
});

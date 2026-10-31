import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { run } from '../src/cli.js';

const sample = fileURLToPath(new URL('./data/sample.log', import.meta.url));

function sink() {
  const chunks = [];
  return { write: (chunk) => chunks.push(chunk), text: () => chunks.join('') };
}

test('prints a text summary to stdout', async () => {
  const stdout = sink();
  assert.equal(await run([sample], { stdout, stderr: sink() }), 0);
  assert.match(stdout.text(), /^ERROR 2$/m);
  assert.match(stdout.text(), /^total 6$/m);
});

test('prints JSON with --format json', async () => {
  const stdout = sink();
  assert.equal(await run([sample, '--format', 'json'], { stdout, stderr: sink() }), 0);
  assert.deepEqual(JSON.parse(stdout.text()), {
    total: 6,
    counts: { ERROR: 2, WARN: 1, INFO: 2, DEBUG: 1 },
    skipped: 0,
  });
});

test('writes the report to --output instead of stdout', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'logtally-'));
  const out = path.join(dir, 'report.txt');
  const stdout = sink();
  assert.equal(await run([sample, '--output', out], { stdout, stderr: sink() }), 0);
  assert.equal(stdout.text(), '');
  assert.match(await readFile(out, 'utf8'), /^total 6$/m);
});

test('exits 1 when the log cannot be read', async () => {
  const stderr = sink();
  assert.equal(await run(['nope.log'], { stdout: sink(), stderr }), 1);
  assert.match(stderr.text(), /cannot read nope\.log: ENOENT/);
});

test('exits 2 with usage on a bad option', async () => {
  const stderr = sink();
  assert.equal(await run(['--format', 'xml', sample], { stdout: sink(), stderr }), 2);
  assert.match(stderr.text(), /usage: logtally/);
});

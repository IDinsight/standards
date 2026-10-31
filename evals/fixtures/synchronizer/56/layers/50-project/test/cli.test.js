import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { runImport } from '../src/import.js';

const sample = fileURLToPath(new URL('./fixtures/sample.csv', import.meta.url));

function capture() {
  return { text: '', write(chunk) { this.text += chunk; } };
}

test('dry run prints only the summary', async () => {
  const stdout = capture();
  assert.equal(await runImport([sample, '--dry-run'], { stdout, stderr: capture() }), 0);
  assert.equal(stdout.text, '3 transactions, net 1372.60\n');
});

test('writes JSON to the --out file', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'ledger-'));
  const out = path.join(dir, 'out.json');
  assert.equal(await runImport([sample, '--out', out], { stdout: capture(), stderr: capture() }), 0);
  const written = JSON.parse(await readFile(out, 'utf8'));
  assert.equal(written.length, 3);
  assert.equal(written[2].category, 'uncategorized');
});

test('a missing file argument is a usage error', async () => {
  const stderr = capture();
  assert.equal(await runImport([], { stdout: capture(), stderr }), 2);
  assert.match(stderr.text, /^usage: ledger import/);
});

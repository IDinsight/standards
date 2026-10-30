import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import { run } from '../src/cli.js';

function capture() {
  const chunks = [];
  return { write: (text) => { chunks.push(text); return true; }, text: () => chunks.join('') };
}

function exec(argv) {
  const stdout = capture();
  const stderr = capture();
  const code = run(argv, { stdout, stderr });
  return { code, stdout: stdout.text(), stderr: stderr.text() };
}

test('exports every record as CSV by default', () => {
  const { code, stdout } = exec([]);
  assert.equal(code, 0);
  const rows = stdout.trimEnd().split('\r\n');
  assert.equal(rows[0], 'id,title,owner,status,createdAt');
  assert.deepEqual(rows.slice(1).map((row) => row.split(',')[0]), ['1', '2', '3', '4']);
});

test('filters by status and owner', () => {
  const { stdout } = exec(['--status', 'active', '--owner', 'dana']);
  assert.equal(stdout, 'id,title,owner,status,createdAt\r\n1,"Lease agreement, Building B",dana,active,2026-03-02T10:15:00Z\r\n');
});

test('--json writes the records as a JSON array', () => {
  const { code, stdout } = exec(['--owner', 'marco', '--json']);
  assert.equal(code, 0);
  assert.deepEqual(JSON.parse(stdout).map((record) => record.id), [4]);
});

test('--out writes to a file instead of standard output', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'export-records-'));
  try {
    const file = path.join(dir, 'archived.csv');
    const { code, stdout } = exec(['--status', 'archived', '--out', file]);
    assert.equal(code, 0);
    assert.equal(stdout, '');
    assert.match(readFileSync(file, 'utf8'), /^id,title,owner,status,createdAt\r\n3,/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('an unknown status is rejected', () => {
  const { code, stderr } = exec(['--status', 'deleted']);
  assert.equal(code, 2);
  assert.match(stderr, /unknown status: deleted/);
});

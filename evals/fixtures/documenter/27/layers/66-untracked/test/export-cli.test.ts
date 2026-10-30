import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, test } from 'node:test';

// Runs the export command as an operator would, against the seed records.
const script = path.join(import.meta.dirname, '..', 'scripts', 'export-records.ts');
const root = mkdtempSync(path.join(tmpdir(), 'records-export-cli-'));
after(() => rmSync(root, { recursive: true, force: true }));

function run(args: string[]) {
  return spawnSync(process.execPath, [script, ...args], { encoding: 'utf8' });
}

test('exports the filtered records to standard output', () => {
  const result = run(['--owner', 'dana']);
  assert.equal(result.status, 0);
  assert.equal(
    result.stdout,
    'id,title,owner,status,createdAt\r\n'
      + '1,"Lease agreement, Building B",dana,active,2026-03-02T10:15:00Z\r\n'
      + '3,"Q2 ""priority"" accounts review",dana,archived,2026-04-01T08:05:00Z\r\n',
  );
});

test('--columns selects and orders the columns', () => {
  const result = run(['--status', 'active', '--columns', 'id,title']);
  assert.equal(result.status, 0);
  assert.equal(
    result.stdout,
    'id,title\r\n1,"Lease agreement, Building B"\r\n2,Vendor onboarding checklist\r\n'
      + '4,Insurance renewal 2026\r\n6,Office move inventory\r\n',
  );
});

test('--out writes the CSV to a file instead of standard output', () => {
  const file = path.join(root, 'dana.csv');
  const result = run(['--owner', 'dana', '--out', file]);
  assert.equal(result.status, 0);
  assert.equal(result.stdout, '');
  assert.match(result.stderr, /Wrote 2 records to /);
  assert.equal(readFileSync(file, 'utf8'), run(['--owner', 'dana']).stdout);
});

test('an unknown status is rejected with exit status 2 and no output', () => {
  const result = run(['--status', 'deleted']);
  assert.equal(result.status, 2);
  assert.equal(result.stdout, '');
  assert.match(result.stderr, /unknown status: deleted/);
});

test('an unknown column is rejected with exit status 2 and no output', () => {
  const result = run(['--columns', 'id,email']);
  assert.equal(result.status, 2);
  assert.equal(result.stdout, '');
  assert.match(result.stderr, /unknown column: email/);
});

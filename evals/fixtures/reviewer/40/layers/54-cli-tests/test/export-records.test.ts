import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, test } from 'node:test';

import { runExportRecords } from '../src/cli/export-records.ts';

// Runs the command in-process against the seed records, writing into a
// temporary folder that is removed afterwards.
const root = mkdtempSync(path.join(tmpdir(), 'records-cli-'));
after(() => rmSync(root, { recursive: true, force: true }));

const fixedNow = () => new Date('2026-09-24T09:00:00Z');

test('export-records writes the filtered records to a CSV file in the given folder', () => {
  const dir = path.join(root, 'by-owner');
  const result = runExportRecords(['--owner', 'dana', '--out', dir], { now: fixedNow });

  const file = path.join(dir, 'records-20260924T090000Z.csv');
  assert.equal(result.code, 0);
  assert.equal(result.output, `Wrote 2 records to ${file}`);
  assert.equal(
    readFileSync(file, 'utf8'),
    'id,title,owner,status,createdAt\r\n'
      + '1,"Lease agreement, Building B",dana,active,2026-03-02T10:15:00Z\r\n'
      + '3,"Q2 ""priority"" accounts review",dana,archived,2026-04-01T08:05:00Z\r\n',
  );
});

test('export-records rejects an unknown status with exit code 2 and writes no file', () => {
  const dir = path.join(root, 'bad-status');
  const result = runExportRecords(['--status', 'deleted', '--out', dir], { now: fixedNow });

  assert.equal(result.code, 2);
  assert.match(result.output, /unknown status: deleted/);
  assert.equal(existsSync(dir), false);
});

test('export-records rejects an unknown option with exit code 2 and writes no file', () => {
  const dir = path.join(root, 'unknown-option');
  const result = runExportRecords(['--format', 'json', '--out', dir], { now: fixedNow });

  assert.equal(result.code, 2);
  assert.match(result.output, /Unknown option '--format'/);
  assert.equal(existsSync(dir), false);
});

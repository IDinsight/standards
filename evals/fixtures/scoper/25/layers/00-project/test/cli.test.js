import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { run } from '../src/cli.js';

const SAMPLE = fileURLToPath(new URL('../data/sample-records.json', import.meta.url));

function stream() {
  const chunks = [];
  return { write: (chunk) => { chunks.push(chunk); }, text: () => chunks.join('') };
}

function exportWith(args) {
  const stdout = stream();
  const stderr = stream();
  const code = run(args, { stdout, stderr });
  return { code, stdout: stdout.text(), stderr: stderr.text() };
}

function scratch(name) {
  return path.join(mkdtempSync(path.join(tmpdir(), 'field-export-')), name);
}

test('prints the selected fields as CSV', () => {
  const result = exportWith(['--input', SAMPLE, '--fields', 'id,name']);
  assert.equal(result.code, 0);
  assert.equal(result.stdout, 'id,name\n1,Kibera clinic\n2,"Lakeside, North"\n3,"Hill ""B"" post"\n');
});

test('uses every field in first-seen order by default', () => {
  const result = exportWith(['--input', SAMPLE]);
  assert.equal(result.code, 0);
  assert.equal(result.stdout.split('\n')[0], 'id,name,district,visits');
});

test('writes to --output and reports the record count', () => {
  const target = scratch('visits.csv');
  const result = exportWith(['--input', SAMPLE, '--output', target, '--delimiter', ';']);
  assert.equal(result.code, 0);
  assert.equal(result.stdout, 'Wrote 3 records to ' + target + '\n');
  assert.match(readFileSync(target, 'utf8'), /^id;name;district;visits\n1;Kibera clinic;Nairobi;42\n/);
});

test('rejects a missing --input', () => {
  const result = exportWith([]);
  assert.equal(result.code, 2);
  assert.equal(result.stderr, 'error: --input is required\n');
});

test('rejects an unknown field', () => {
  const result = exportWith(['--input', SAMPLE, '--fields', 'id,region']);
  assert.equal(result.code, 2);
  assert.equal(result.stderr, 'error: unknown field region\n');
});

test('reports an unreadable input file', () => {
  const broken = scratch('broken.json');
  writeFileSync(broken, '{ not json');
  const result = exportWith(['--input', broken]);
  assert.equal(result.code, 1);
  assert.equal(result.stderr, 'error: cannot read ' + broken + '\n');
});

test('writes only the header for an empty array with --fields', () => {
  const empty = scratch('empty.json');
  writeFileSync(empty, '[]');
  const result = exportWith(['--input', empty, '--fields', 'id,name']);
  assert.equal(result.code, 0);
  assert.equal(result.stdout, 'id,name\n');
});

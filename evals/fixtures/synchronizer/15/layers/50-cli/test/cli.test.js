import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, test } from 'node:test';

import { USAGE, VERSION, run } from '../src/cli.js';

const dir = mkdtempSync(path.join(tmpdir(), 'records-export-'));
after(() => rmSync(dir, { recursive: true, force: true }));

const input = path.join(dir, 'records.json');
writeFileSync(input, JSON.stringify([
  { id: 1, title: 'Lease agreement, Building B', owner: 'dana', status: 'active' },
  { id: 2, title: 'Vendor onboarding checklist', owner: 'li', status: 'active' },
]));

function exec(argv) {
  const out = { text: '', write(chunk) { out.text += chunk; return true; } };
  const err = { text: '', write(chunk) { err.text += chunk; return true; } };
  const code = run(argv, { stdout: out, stderr: err });
  return { code, stdout: out.text, stderr: err.text };
}

test('exports every column of the first record to standard output', () => {
  const result = exec([input]);
  assert.equal(result.code, 0);
  assert.equal(
    result.stdout,
    'id,title,owner,status\r\n'
      + '1,"Lease agreement, Building B",dana,active\r\n'
      + '2,Vendor onboarding checklist,li,active\r\n',
  );
});

test('--columns and -c select and order columns', () => {
  assert.equal(exec([input, '--columns', 'owner,id']).stdout, 'owner,id\r\ndana,1\r\nli,2\r\n');
  assert.equal(exec(['-c', 'id', input]).stdout, 'id\r\n1\r\n2\r\n');
});

test('--output writes the file and reports the count on standard error', () => {
  const target = path.join(dir, 'out.csv');
  const result = exec([input, '--output', target]);
  assert.equal(result.code, 0);
  assert.equal(result.stdout, '');
  assert.equal(result.stderr, `records-export: wrote 2 records to ${target}\n`);
  assert.equal(readFileSync(target, 'utf8'), exec([input]).stdout);
});

test('--delimiter changes the separator and what needs quoting', () => {
  assert.equal(
    exec([input, '--delimiter', ';', '-c', 'id,title']).stdout,
    'id;title\r\n1;Lease agreement, Building B\r\n2;Vendor onboarding checklist\r\n',
  );
});

test('usage errors exit with status 2 and print the usage', () => {
  const unknown = exec(['--input', input]);
  assert.equal(unknown.code, 2);
  assert.equal(unknown.stderr, `records-export: unknown option: --input\n${USAGE}`);
  assert.equal(exec([]).code, 2);
  assert.equal(exec([input, '--delimiter', '||']).code, 2);
});

test('an unreadable input file exits with status 1', () => {
  const result = exec([path.join(dir, 'missing.json')]);
  assert.equal(result.code, 1);
  assert.match(result.stderr, /^records-export: cannot read /);
});

test('--help and --version print to standard output', () => {
  assert.equal(exec(['--help']).stdout, USAGE);
  assert.equal(exec(['-v']).stdout, `${VERSION}\n`);
});

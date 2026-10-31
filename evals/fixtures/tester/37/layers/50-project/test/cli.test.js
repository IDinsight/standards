import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { run } from '../src/cli.js';

const SAMPLE = fileURLToPath(new URL('../data/sample.json', import.meta.url));

function sink() {
  return { text: '', write(chunk) { this.text += chunk; } };
}

test('export writes CSV for the sample inventory', async () => {
  const stdout = sink();
  const stderr = sink();
  const code = await run(['export', SAMPLE], { stdout, stderr });
  assert.equal(code, 0);
  assert.equal(stdout.text, [
    'sku,name,quantity,location',
    'A-100,"Hex bolt, M6",240,Aisle 3',
    'B-220,"Washer ""flat"" 6mm",1200,Aisle 3',
    'C-031,Cable tie,0,',
    '',
  ].join('\n'));
  assert.equal(stderr.text, '');
});

test('missing file argument prints usage', async () => {
  const stdout = sink();
  const stderr = sink();
  const code = await run(['export'], { stdout, stderr });
  assert.equal(code, 2);
  assert.match(stderr.text, /^Usage: inventory export/);
  assert.equal(stdout.text, '');
});

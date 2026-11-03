import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const cli = fileURLToPath(new URL('../bin/mdtoc.js', import.meta.url));

function run(args, cwd) {
  return spawnSync(process.execPath, [cli, ...args], { cwd, encoding: 'utf8' });
}

function project(markdown) {
  const dir = mkdtempSync(path.join(tmpdir(), 'mdtoc-cli-'));
  writeFileSync(path.join(dir, 'doc.md'), markdown);
  return dir;
}

const DOC = '# Doc\n\n<!-- toc -->\n<!-- tocstop -->\n\n## Install\n\n## Usage\n';

test('prints the table of contents', () => {
  const result = run(['doc.md'], project(DOC));
  assert.equal(result.status, 0);
  assert.equal(result.stdout, '- [Install](#install)\n- [Usage](#usage)\n');
});

test('--write updates the file and --check then passes', () => {
  const dir = project(DOC);
  assert.equal(run(['doc.md', '--check'], dir).status, 1);
  assert.equal(run(['doc.md', '--write'], dir).status, 0);
  assert.match(readFileSync(path.join(dir, 'doc.md'), 'utf8'), /<!-- toc -->\n\n- \[Install\]\(#install\)/);
  assert.equal(run(['doc.md', '--check'], dir).status, 0);
});

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { checkRelease, compareRoles, majorOf } from '../scripts/check-release.mjs';

const source = fileURLToPath(new URL('../', import.meta.url));
// What a release needs: the published package files plus the upgrade fixtures.
const PARTS = ['bin', 'lib', 'runtime', 'skills', 'templates', 'PROTOCOL.md', 'package.json', 'test/fixtures/upgrade'];

const git = (repo, ...args) => execFileSync('git', ['-C', repo, '-c', 'user.name=Test', '-c', 'user.email=test@example.com', ...args],
  { encoding: 'utf8' });

// A git repository whose first commit, tagged as a release, is this checkout.
// `change` then edits the tree for the next release, which is committed.
function release(change) {
  const repo = mkdtempSync(path.join(os.tmpdir(), 'standards-release-test-'));
  try {
    for (const part of PARTS) cpSync(path.join(source, part), path.join(repo, part), { recursive: true });
    writeFileSync(path.join(repo, '.gitignore'), 'node_modules\n');
    symlinkSync(path.join(source, 'node_modules'), path.join(repo, 'node_modules'), 'dir');
    git(repo, 'init', '-q', '-b', 'main');
    git(repo, 'add', '-A');
    git(repo, 'commit', '-q', '-m', 'previous release');
    const version = JSON.parse(readFileSync(path.join(repo, 'package.json'), 'utf8')).version;
    git(repo, 'tag', `v${version}`);
    change(repo, version);
    git(repo, 'add', '-A');
    git(repo, 'commit', '-q', '--allow-empty', '-m', 'next release');
    return checkRelease(repo);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
}

function setVersion(repo, version) {
  const file = path.join(repo, 'package.json');
  writeFileSync(file, readFileSync(file, 'utf8').replace(/"version": "[^"]+"/, `"version": "${version}"`));
}

const nextMinor = (version) => version.replace(/^(\d+)\.(\d+)\.\d+$/, (_, major, minor) => `${major}.${Number(minor) + 1}.0`);
const nextMajor = (version) => `${majorOf(version) + 1}.0.0`;
const addRole = (repo) => cpSync(path.join(repo, 'skills/scoper'), path.join(repo, 'skills/planner'), { recursive: true });

test('roles and versions are compared as expected', () => {
  assert.deepEqual(compareRoles(['a', 'b'], ['b', 'c']), { added: ['c'], removed: ['a'] });
  assert.equal(majorOf('0.3.1'), 0);
  assert.throws(() => majorOf('1.0'), /Invalid version/);
});

test('a change that is not a release is skipped', () => {
  const result = release(() => {});
  assert.equal(result.ok, true);
  assert.match(result.lines.join('\n'), /not a release\. Skipping/);
});

test('a compatible minor release passes the role check and the upgrade test', () => {
  const result = release((repo, version) => setVersion(repo, nextMinor(version)));
  assert.equal(result.ok, true, result.lines.join('\n'));
  assert.match(result.lines.join('\n'), /Roles unchanged/);
  assert.match(result.lines.join('\n'), /Upgrade test passed/);
});

test('a new role needs a major version', () => {
  const minor = release((repo, version) => {
    setVersion(repo, nextMinor(version));
    addRole(repo);
  });
  assert.equal(minor.ok, false);
  assert.match(minor.lines.join('\n'), /FAIL: Roles changed since v[\d.]+ \(added: planner; removed: none\)/);

  const major = release((repo, version) => {
    setVersion(repo, nextMajor(version));
    addRole(repo);
  });
  assert.equal(major.ok, true, major.lines.join('\n'));
  assert.match(major.lines.join('\n'), /upgrade test is skipped/);
});

test('a release whose check rejects records the previous release accepted fails the upgrade test', () => {
  const result = release((repo, version) => {
    setVersion(repo, nextMinor(version));
    // Pretend the new release renames the documentation discrepancy prefix again.
    const file = path.join(repo, 'runtime/check.mjs');
    writeFileSync(file, readFileSync(file, 'utf8').replace("headingIds(artifact.text, 'D').length", "headingIds(artifact.text, 'DOC').length"));
  });
  assert.equal(result.ok, false);
  assert.match(result.lines.join('\n'), /standard-documenting: check\.mjs reports problems in files that the previous release accepted/);
});

test('a release that cannot read saved workflow states fails the upgrade test', () => {
  const result = release((repo, version) => {
    setVersion(repo, nextMinor(version));
    // Pretend the new release requires a STATE.md field older states lack.
    const file = path.join(repo, 'runtime/lib/state.mjs');
    writeFileSync(file, readFileSync(file, 'utf8').replace("for (const name of ['Request',", "for (const name of ['Owner', 'Request',"));
  });
  assert.equal(result.ok, false);
  const output = result.lines.join('\n');
  assert.match(output, /FAIL: Upgrade test: .*upgrading from v[\d.]+ failed:[\s\S]*Invalid or missing Owner/);
  assert.match(output, /make this a major release/);
});

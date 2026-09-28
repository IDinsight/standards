#!/usr/bin/env node
// Release checks for pull requests. They run only when package.json's version
// differs from the latest release tag, which is the case on a release-please
// pull request. Existing projects can upgrade only within one major version, so
// a release that is not major must stay compatible with the previous one:
//
//   1. Adding, removing, or renaming a role requires a major version.
//   2. Without a major version, the new installer must upgrade projects that the
//      previous release installed, including the saved workflow states and
//      cycle records in test/fixtures/upgrade/, without changing their STATE.md
//      or CYCLE_IDS.md, and the new check.mjs must find no problem in them.
//
// Needs the full git history and tags (actions/checkout with fetch-depth: 0).
//
//   node scripts/check-release.mjs [--repo <path>]
import { execFileSync, spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const MARKER = '<!-- standards:framework-owned -->';

function git(repo, args) {
  return execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

// The most recent release tag reachable from HEAD, or null before the first release.
export function latestTag(repo) {
  try {
    return git(repo, ['describe', '--tags', '--abbrev=0', '--match', 'v[0-9]*']).trim();
  } catch {
    return null;
  }
}

export function majorOf(version) {
  const match = /^(\d+)\.\d+\.\d+$/.exec(version);
  if (!match) throw new Error(`Invalid version: ${version}`);
  return Number(match[1]);
}

// Role packages: folders under skills/ whose SKILL.md carries the framework
// marker. `ref` is a git revision, or null for the working tree.
export function rolesAt(repo, ref) {
  if (ref === null) {
    return readdirSync(path.join(repo, 'skills'), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .filter((name) => readFileSync(path.join(repo, 'skills', name, 'SKILL.md'), 'utf8').includes(MARKER))
      .sort();
  }
  return git(repo, ['ls-tree', '-r', '--name-only', ref, '--', 'skills'])
    .split('\n')
    .map((file) => /^skills\/([^/]+)\/SKILL\.md$/.exec(file)?.[1])
    .filter((name) => name && git(repo, ['show', `${ref}:skills/${name}/SKILL.md`]).includes(MARKER))
    .sort();
}

export function compareRoles(before, after) {
  return {
    added: after.filter((role) => !before.includes(role)),
    removed: before.filter((role) => !after.includes(role)),
  };
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8' });
  const problem = result.error ? `\n(${result.error.message})` : result.signal ? `\n(stopped by ${result.signal})` : '';
  return { code: result.status, stdout: result.stdout ?? '',
    output: `${result.stdout ?? ''}${result.stderr ?? ''}`.trim() + problem };
}

// Install the release at `tag` into a temporary project for each fixture, load
// the fixture's saved files, and upgrade with this checkout. Returns a list of
// failure messages.
export function upgradeFailures(repo, tag) {
  const work = mkdtempSync(path.join(os.tmpdir(), 'standards-release-check-'));
  const failures = [];
  try {
    const previous = path.join(work, 'previous');
    mkdirSync(previous);
    const archive = execFileSync('git', ['-C', repo, 'archive', '--format=tar', tag], { maxBuffer: 256 * 1024 * 1024 });
    execFileSync('tar', ['-x', '-C', previous], { input: archive });
    // The previous CLI needs its npm dependencies; reuse this checkout's.
    if (existsSync(path.join(repo, 'node_modules'))) {
      symlinkSync(path.join(repo, 'node_modules'), path.join(previous, 'node_modules'), 'dir');
    }
    const fixtures = path.join(repo, 'test/fixtures/upgrade');
    for (const name of readdirSync(fixtures, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort()) {
      const fixture = path.join(fixtures, name);
      const saved = path.join(fixture, '.standards');
      const project = path.join(work, 'projects', name);
      mkdirSync(project, { recursive: true });
      writeFileSync(path.join(project, 'app.py'), 'print("hello")\n');
      const mode = /`ProjectMode`:\s*`([A-Z]+)`/.exec(readFileSync(path.join(saved, 'MODE.md'), 'utf8'))[1].toLowerCase();
      const installed = run(process.execPath, [path.join(previous, 'bin/standards.js'), 'install', '--project', project,
        '--mode', mode, '--yes'], project);
      if (installed.code !== 0) {
        failures.push(`${name}: the ${tag} installer failed:\n${installed.output}`);
        continue;
      }
      // Load the saved runtime files and the cycle's records under .standards/docs/.
      cpSync(fixture, project, { recursive: true });
      const before = ['STATE.md', 'CYCLE_IDS.md'].map((file) => readFileSync(path.join(project, '.standards', file), 'utf8'));
      const upgraded = run(process.execPath, [path.join(repo, 'bin/standards.js'), 'install', '--project', project, '--yes'], project);
      if (upgraded.code !== 0) {
        failures.push(`${name}: upgrading from ${tag} failed:\n${upgraded.output}`);
        continue;
      }
      const after = ['STATE.md', 'CYCLE_IDS.md'].map((file) => readFileSync(path.join(project, '.standards', file), 'utf8'));
      if (after[0] !== before[0] || after[1] !== before[1]) {
        failures.push(`${name}: the upgrade changed STATE.md or CYCLE_IDS.md.`);
      }
      // The saved files follow the record formats of the previous release, so the
      // new check must accept them as they are.
      const checked = run(process.execPath, [path.join(project, '.standards/bin/check.mjs'), '--json'], project);
      let report = null;
      try { report = JSON.parse(checked.stdout); } catch { /* reported below */ }
      if (!report) {
        failures.push(`${name}: check.mjs could not read the upgraded project (exit ${checked.code}):\n${checked.output}`);
      } else if (report.problems.length) {
        failures.push(`${name}: check.mjs reports problems in files that the previous release accepted:\n`
          + report.problems.map(({ file, message }) => `- ${file}: ${message}`).join('\n'));
      }
    }
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
  return failures;
}

export function checkRelease(repo) {
  const tag = latestTag(repo);
  if (!tag) return { ok: true, lines: ['No release tag found; nothing to compare.'] };
  const version = JSON.parse(readFileSync(path.join(repo, 'package.json'), 'utf8')).version;
  const previous = JSON.parse(git(repo, ['show', `${tag}:package.json`])).version;
  if (version === previous) {
    return { ok: true, lines: [`package.json is still ${version}, the version of ${tag}; this is not a release. Skipping.`] };
  }
  const major = majorOf(version) > majorOf(previous);
  const lines = [`Checking release ${previous} -> ${version} (${major ? 'major' : 'not major'}).`];
  const failures = [];

  const { added, removed } = compareRoles(rolesAt(repo, tag), rolesAt(repo, null));
  if ((added.length || removed.length) && !major) {
    failures.push(`Roles changed since ${tag} (added: ${added.join(', ') || 'none'}; removed: ${removed.join(', ') || 'none'}), `
      + `but ${version} is not a major version. Adding, removing, or renaming a role needs a major release: mark `
      + 'the commit with `feat!:` or a `BREAKING CHANGE:` footer, or add a `Release-As: <major>.0.0` footer.');
  } else {
    lines.push(added.length || removed.length ? 'Roles changed, and the version is major.' : 'Roles unchanged.');
  }

  if (major) {
    lines.push('Major release: existing projects must uninstall and reinstall, so the upgrade test is skipped.');
  } else {
    const upgrade = upgradeFailures(repo, tag);
    if (upgrade.length) {
      failures.push(...upgrade.map((message) => `Upgrade test: ${message}`));
      failures.push('A release that is not major must upgrade projects installed by the previous release. Fix the '
        + 'incompatibility, or make this a major release.');
    } else {
      lines.push(`Upgrade test passed: ${tag} installs upgrade cleanly, including every saved state in test/fixtures/upgrade/.`);
    }
  }
  return { ok: failures.length === 0, lines: [...lines, ...failures.map((message) => `FAIL: ${message}`)] };
}

// Compare real paths so the check also runs when started through a symlink.
const invoked = process.argv[1] ? realpathSync(process.argv[1]) : null;
if (invoked && invoked === realpathSync(fileURLToPath(import.meta.url))) {
  const args = process.argv.slice(2);
  const repo = path.resolve(args[0] === '--repo' && args[1] ? args[1] : process.cwd());
  try {
    const { ok, lines } = checkRelease(repo);
    process.stdout.write(`${lines.join('\n')}\n`);
    process.exitCode = ok ? 0 : 1;
  } catch (error) {
    process.stderr.write(`Release check could not run: ${error.message}\n`);
    process.exitCode = 1;
  }
}

import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const run = promisify(execFile);
const sourceRoot = fileURLToPath(new URL('../', import.meta.url));

async function compareTree(source, packed) {
  if ((await stat(source)).isFile()) {
    assert.deepEqual(await readFile(packed), await readFile(source), `Packed file differs: ${packed}`);
    return;
  }
  assert.ok((await stat(packed)).isDirectory(), `Missing packed directory: ${packed}`);
  for (const entry of await readdir(source, { withFileTypes: true })) {
    if (entry.name === '.DS_Store') continue;
    const left = path.join(source, entry.name);
    const right = path.join(packed, entry.name);
    if (entry.isDirectory() || entry.isFile()) {
      await compareTree(left, right);
    } else {
      throw new Error(`Unexpected source asset: ${left}`);
    }
  }
}

const temporary = await mkdtemp(path.join(os.tmpdir(), 'standards-packed-test-'));
try {
  const { stdout } = await run('pnpm', ['pack', '--pack-destination', temporary], {
    cwd: sourceRoot,
  });
  const archives = (await readdir(temporary)).filter((name) => name.endsWith('.tgz'));
  assert.equal(archives.length, 1, `Expected one pnpm archive; output: ${stdout}`);
  await run('tar', ['-xzf', path.join(temporary, archives[0]), '-C', temporary]);

  const packedRoot = path.join(temporary, 'package');
  const packageJson = JSON.parse(await readFile(path.join(packedRoot, 'package.json'), 'utf8'));
  assert.equal(packageJson.name, '@idinsight/standards');
  assert.equal(packageJson.bin.standards, './bin/standards.js');
  assert.ok(packageJson.dependencies['@clack/prompts']);
  assert.ok((await stat(path.join(packedRoot, 'bin/standards.js'))).mode & 0o111);
  for (const asset of ['PROTOCOL.md', 'skills', 'templates', 'lib', 'bin']) {
    await compareTree(path.join(sourceRoot, asset), path.join(packedRoot, asset));
  }

  const consumer = path.join(temporary, 'consumer');
  await mkdir(consumer);
  await writeFile(path.join(consumer, 'package.json'), '{"private":true}\n');
  await run('pnpm', ['add', '--save-exact', path.join(temporary, archives[0])], { cwd: consumer });
  const installedRoot = path.join(consumer, 'node_modules/@idinsight/standards');
  const executable = path.join(installedRoot, 'bin/standards.js');
  const version = await run(process.execPath, [executable, '--version']);
  assert.equal(version.stdout.trim(), packageJson.version);

  const project = path.join(temporary, 'project');
  await mkdir(project);
  const first = await run(process.execPath, [executable, 'install', '--project', project]);
  assert.match(first.stdout, /Installed STANDARDS/);
  const installedVersion = JSON.parse(await readFile(path.join(project, '.standards/VERSION.json'), 'utf8'));
  assert.equal(installedVersion.version, packageJson.version);
  await stat(path.join(project, '.agents/skills/scoper/SKILL.md'));
  await stat(path.join(project, '.claude/skills/scoper/SKILL.md'));
  const second = await run(process.execPath, [executable, 'install', '--project', project]);
  assert.match(second.stdout, /Verified STANDARDS/);

  const registryPath = path.join(project, '.standards/CYCLE_IDS.md');
  const registry = `${await readFile(registryPath, 'utf8')}- reserved-test-cycle-123\n`;
  await writeFile(registryPath, registry);
  // Simulate the next compatible package release without changing the source checkout.
  const [major, minor] = packageJson.version.split('.').map(Number);
  const nextVersion = `${major}.${minor + 1}.0`;
  await writeFile(path.join(installedRoot, 'package.json'), `${JSON.stringify({
    ...packageJson, version: nextVersion,
  }, null, 2)}\n`);
  const upgraded = await run(process.execPath, [executable, 'install', '--project', project]);
  assert.match(upgraded.stdout, /Updated STANDARDS/);
  assert.equal(JSON.parse(await readFile(path.join(project, '.standards/VERSION.json'), 'utf8')).version,
    nextVersion);
  assert.equal(await readFile(registryPath, 'utf8'), registry);
  const preview = await run(process.execPath, [executable, 'uninstall', '--project', project, '--dry-run']);
  assert.match(preview.stdout, /Would uninstall STANDARDS/);
  assert.equal(await readFile(registryPath, 'utf8'), registry);
  const removed = await run(process.execPath, [executable, 'uninstall', '--project', project]);
  assert.match(removed.stdout, /Uninstalled STANDARDS/);
  assert.equal((await readdir(project)).includes('.standards'), false);
  assert.equal((await readdir(project)).includes('.agents'), false);
  assert.equal((await readdir(project)).includes('.claude'), false);
  const repeated = await run(process.execPath, [executable, 'uninstall', '--project', project]);
  assert.match(repeated.stdout, /No STANDARDS installation found/);
  const fresh = await run(process.execPath, [executable, 'install', '--project', project]);
  assert.match(fresh.stdout, /Installed STANDARDS/);
  process.stdout.write(`Packed @idinsight/standards@${packageJson.version}: assets, install, reinstall, compatible upgrade, and uninstall verified\n`);
} finally {
  await rm(temporary, { recursive: true, force: true });
}

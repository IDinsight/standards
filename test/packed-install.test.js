import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const run = promisify(execFile);
const sourceRoot = fileURLToPath(new URL('../', import.meta.url));

// Compare a source asset with its packed copy. Skill `evals/` folders are for
// developing the skills and are left out of the package.
async function compareTree(source, packed) {
  if ((await stat(source)).isFile()) {
    assert.deepEqual(await readFile(packed), await readFile(source), `Packed file differs: ${packed}`);
    return;
  }
  assert.ok((await stat(packed)).isDirectory(), `Missing packed directory: ${packed}`);
  for (const entry of await readdir(source, { withFileTypes: true })) {
    if (entry.name === '.DS_Store') continue;
    if (entry.name === 'evals' && path.basename(path.dirname(source)) === 'skills') {
      await assert.rejects(stat(path.join(packed, entry.name)), `Packed evals: ${packed}`);
      continue;
    }
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
  for (const asset of ['PROTOCOL.md', 'protocol', 'skills', 'templates', 'lib', 'bin', 'runtime']) {
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
  // The packed runtime tools and hooks work in the installed project.
  assert.match(await readFile(path.join(project, '.codex/hooks.json'), 'utf8'), /\.standards\/bin\/hook\.mjs/);
  assert.match(await readFile(path.join(project, '.claude/settings.json'), 'utf8'), /\.standards\/bin\/hook\.mjs/);
  const checked = await run(process.execPath, [path.join(project, '.standards/bin/check.mjs')]);
  assert.match(checked.stdout, /STANDARDS check passed/);
  // Invocation discovery is installed ready to use, without registration,
  // generation, or dependencies in the target project.
  for (const client of ['codex', 'claude']) {
    const invocation = JSON.parse((await run(process.execPath,
      [path.join(project, '.standards/bin/invocation.mjs'), 'navigator', '--client', client, '--json'])).stdout);
    assert.equal(invocation.catalogStatus, 'complete');
    assert.equal(invocation.complete, true);
    assert.equal(invocation.client, client);
    assert.equal(invocation.groups[0].selected.status, 'conversation');
  }
  const cycle = await run(process.execPath, [path.join(project, '.standards/bin/cycle.mjs'), 'new', '--request', 'Packed test']);
  assert.match(cycle.stdout, /^packed-test-\d{8}T\d{6}Z-[0-9a-f]{8}\n$/);
  const second = await run(process.execPath, [executable, 'install', '--project', project]);
  assert.match(second.stdout, /Verified STANDARDS/);
  await stat(path.join(project, '.claude/skills/scoper/SKILL.md'));
  await assert.rejects(stat(path.join(project, '.claude/skills/scoper/evals')));

  const contextPath = path.join(project, '.standards/CONTEXT.md');
  await writeFile(contextPath, '# Project Context\n');
  const reset = await run(process.execPath, [executable, 'reset', '--project', project]);
  assert.match(reset.stdout, /Reset STANDARDS/);
  await assert.rejects(stat(contextPath));
  // A packed Brownfield install supports standalone documentation coordination
  // in both clients, including its new architecture mode and omitted-owner guard.
  const docsProject = path.join(temporary, 'documentation-project');
  await mkdir(docsProject);
  await writeFile(path.join(docsProject, 'app.py'), 'print("hello")\n');
  await run(process.execPath, [executable, 'install', '--project', docsProject, '--yes']);
  for (const base of ['.agents/skills', '.claude/skills']) {
    for (const role of ['auditor', 'scoper', 'architect', 'documenter', 'reviewer', 'synchronizer']) {
      assert.equal(await readFile(path.join(docsProject, base, role, 'SKILL.md'), 'utf8'),
        await readFile(path.join(sourceRoot, 'skills', role, 'SKILL.md'), 'utf8'));
    }
    await stat(path.join(docsProject, base, 'architect/modes/documentation.md'));
  }
  const docsBin = path.join(docsProject, '.standards/bin');
  const docsId = (await run(process.execPath, [path.join(docsBin, 'cycle.mjs'), 'new', '--request', 'Document greeting'])).stdout.trim();
  const docsStatePath = path.join(docsProject, '.standards/STATE.md');
  const docsState = (await readFile(docsStatePath, 'utf8'))
    .replace('`Id`: `UNSET`', `\`Id\`: \`${docsId}\``)
    .replace('`Request`: `UNSET`', '`Request`: `Standalone Documenter: document the existing greeting.`')
    .replace('`CycleMode`: `UNSET`', '`CycleMode`: `DOCUMENTATION`');
  await writeFile(docsStatePath, docsState);
  assert.match((await run(process.execPath, [path.join(docsBin, 'check.mjs')])).stdout, /STANDARDS check passed/);
  await assert.rejects(run(process.execPath, [path.join(docsBin, 'artifact.mjs'), 'init', 'DEVELOPMENT']),
    (error) => error.code === 1 && /DOCUMENTATION omits DEVELOPMENT/.test(error.stderr));
  assert.equal((await readdir(path.join(docsProject, '.standards'))).includes('docs'), false);
  await run(process.execPath, [executable, 'uninstall', '--project', docsProject, '--yes']);
  assert.equal(await readFile(path.join(docsProject, 'app.py'), 'utf8'), 'print("hello")\n');
  const context = '# Project Context\n';
  await writeFile(contextPath, context);
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
  assert.equal(await readFile(contextPath, 'utf8'), context);
  const preview = await run(process.execPath, [executable, 'uninstall', '--project', project, '--dry-run']);
  assert.match(preview.stdout, /Would uninstall STANDARDS/);
  assert.equal(await readFile(contextPath, 'utf8'), context);
  const removed = await run(process.execPath, [executable, 'uninstall', '--project', project]);
  assert.match(removed.stdout, /Uninstalled STANDARDS/);
  assert.equal((await readdir(project)).includes('.standards'), false);
  assert.equal((await readdir(project)).includes('.agents'), false);
  assert.equal((await readdir(project)).includes('.claude'), false);
  assert.equal((await readdir(project)).includes('.codex'), false);
  const repeated = await run(process.execPath, [executable, 'uninstall', '--project', project]);
  assert.match(repeated.stdout, /No STANDARDS installation found/);
  const fresh = await run(process.execPath, [executable, 'install', '--project', project]);
  assert.match(fresh.stdout, /Installed STANDARDS/);
  process.stdout.write(`Packed @idinsight/standards@${packageJson.version}: assets, install, runtime tools, hooks, reinstall, reset, compatible upgrade, and uninstall verified\n`);
} finally {
  await rm(temporary, { recursive: true, force: true });
}

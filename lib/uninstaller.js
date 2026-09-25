import { readdir } from 'node:fs/promises';
import path from 'node:path';

import {
  applyOperations, assertNoInterruptedTransaction, inspectPath, readProjectFile, verifyNormalDirectory,
} from './install-files.js';
import { MARKER, CLIENT_PATHS, blockRange, jsonObject, validateManifest } from './ownership.js';

function uninstallManifest(text) {
  const manifest = validateManifest(text);
  // A newer ownership format needs an uninstaller that understands every recorded mutation.
  const settings = manifest.managedClientSettings;
  if (Object.keys(manifest).some((key) => !['framework', 'createdPaths', 'managedClientSettings'].includes(key))
      || Object.keys(settings).some((key) => key !== '.claude/settings.json')
      || Object.keys(settings['.claude/settings.json']).some((key) => key !== 'skillOverrides')) {
    throw new Error('Unsupported ownership records in .standards/INSTALLATION.json; use an uninstaller that understands them');
  }
  return manifest;
}

async function findOwnedSkills(root, runtimeExists) {
  const knownRoles = new Set((await readdir(new URL('../skills/', import.meta.url), { withFileTypes: true }))
    .filter((entry) => entry.isDirectory()).map((entry) => entry.name));
  const paths = [];
  const clients = [];
  for (const [client, base] of Object.entries(CLIENT_PATHS)) {
    const baseEntry = await inspectPath(root, base);
    if (!baseEntry) continue;
    if (!baseEntry.isDirectory()) throw new Error('Skill collision: ' + base + ' is not a directory');
    const entries = await readdir(path.join(root, base), { withFileTypes: true });
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      const relative = base + '/' + entry.name;
      const expected = runtimeExists && knownRoles.has(entry.name);
      if (!entry.isDirectory()) {
        if (expected) throw new Error('Skill collision: ' + relative + ' is not a normal directory');
        // Unrelated files and symlinks are project-owned; never follow or delete them.
        continue;
      }
      const skill = await readProjectFile(root, relative + '/SKILL.md');
      if (!skill?.includes(MARKER)) {
        if (expected) throw new Error('Skill collision: ' + relative + ' is not framework-owned');
        continue;
      }
      await verifyNormalDirectory(path.join(root, relative));
      paths.push(relative);
      if (!clients.includes(client)) clients.push(client);
    }
  }
  return { paths, clients };
}

async function removeOwnedSettings(root, manifest, operations, warnings) {
  const relative = '.claude/settings.json';
  const owned = manifest.managedClientSettings[relative].skillOverrides;
  const created = manifest.createdPaths?.includes(relative) ?? false;
  if (Object.keys(owned).length === 0 && !created) return;
  const existing = await readProjectFile(root, relative);
  if (existing === null) return;
  const settings = jsonObject(existing, relative);
  if (settings.skillOverrides !== undefined
      && (!settings.skillOverrides || typeof settings.skillOverrides !== 'object'
        || Array.isArray(settings.skillOverrides))) {
    throw new Error('Invalid skillOverrides in ' + relative + '; cannot compare recorded settings safely');
  }
  if (settings.skillOverrides === undefined && Object.keys(owned).length > 0) return;
  let changed = false;
  for (const [role, installedValue] of Object.entries(owned)) {
    if (!Object.hasOwn(settings.skillOverrides, role)) continue;
    if (settings.skillOverrides[role] === installedValue) {
      delete settings.skillOverrides[role];
      changed = true;
    } else {
      warnings.push('Preserved changed setting: ' + relative + ' skillOverrides.' + role);
    }
  }
  if (created && Object.keys(settings).length === 2
      && settings.$schema === 'https://json.schemastore.org/claude-code-settings.json'
      && settings.skillOverrides && Object.keys(settings.skillOverrides).length === 0) {
    operations.push({ kind: 'remove', relative });
  } else if (changed) {
    // Keep existing files and created files with user-owned settings.
    operations.push({ kind: 'file', relative, contents: JSON.stringify(settings, null, 2) + '\n' });
  }
}

async function removeEmptyCreatedDirectories(root, manifest, operations) {
  const created = new Set(manifest.createdPaths ?? []);
  const planned = new Set(operations.filter((operation) => operation.kind === 'remove')
    .map((operation) => operation.relative));
  for (const relative of ['.agents/skills', '.claude/skills', '.agents', '.claude']) {
    if (!created.has(relative)) continue;
    const entry = await inspectPath(root, relative);
    if (!entry) continue;
    if (!entry.isDirectory()) throw new Error('Recorded installer directory is not a directory: ' + relative);
    const children = await readdir(path.join(root, relative));
    if (children.every((name) => planned.has(relative + '/' + name))) {
      operations.push({ kind: 'remove', relative });
      planned.add(relative);
    }
  }
}

export async function uninstallProject({ projectRoot, dryRun = false }) {
  await assertNoInterruptedTransaction(projectRoot);
  const runtime = await inspectPath(projectRoot, '.standards');
  let manifest;
  if (runtime) {
    if (!runtime.isDirectory()) throw new Error('Path collision: .standards is not a directory');
    const protocol = await readProjectFile(projectRoot, '.standards/PROTOCOL.md');
    if (!protocol?.includes(MARKER)) throw new Error('Path collision: .standards is not framework-owned');
    const record = await readProjectFile(projectRoot, '.standards/INSTALLATION.json');
    if (record === null) throw new Error('Incomplete runtime: missing .standards/INSTALLATION.json; cannot determine settings ownership');
    manifest = uninstallManifest(record);
    await verifyNormalDirectory(path.join(projectRoot, '.standards'));
  }

  const warnings = [];
  const operations = [];
  const skills = await findOwnedSkills(projectRoot, Boolean(runtime));
  for (const relative of ['AGENTS.md', 'CLAUDE.md']) {
    const existing = await readProjectFile(projectRoot, relative);
    if (existing === null) continue;
    const range = blockRange(existing, relative);
    if (!range) continue;
    const contents = existing.slice(0, range.start) + existing.slice(range.end);
    operations.push(contents.trim()
      ? { kind: 'file', relative, contents }
      : { kind: 'remove', relative });
  }

  if (!runtime) {
    if (skills.paths.length > 0 || operations.length > 0) {
      throw new Error('Incomplete runtime: STANDARDS skills or integration blocks exist without .standards/INSTALLATION.json; cannot determine settings ownership');
    }
    return { clients: [], paths: [], changed: 0, warnings };
  }

  await removeOwnedSettings(projectRoot, manifest, operations, warnings);
  for (const relative of skills.paths) operations.push({ kind: 'remove', relative });
  await removeEmptyCreatedDirectories(projectRoot, manifest, operations);
  // Retain ownership information until all shared files and skills have been handled.
  operations.push({ kind: 'remove', relative: '.standards' });

  const paths = operations.map(({ kind, relative }) => ({
    action: kind === 'remove' ? 'remove' : 'update', path: relative,
  }));
  const changed = dryRun ? 0 : await applyOperations(projectRoot, operations, {
    scratchPrefix: '.standards-uninstall-',
  });
  return { clients: skills.clients, paths, changed, warnings };
}

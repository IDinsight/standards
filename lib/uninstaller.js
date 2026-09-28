import { lstat, readdir } from 'node:fs/promises';
import path from 'node:path';

import {
  applyOperations, assertNoInterruptedTransaction, inspectPath, readProjectFile, verifyNormalDirectory,
} from './install-files.js';
import {
  MARKER, CLIENT_PATHS, HOOK_FILES, blockRange, jsonObject, validateManifest, withoutStandardsHooks,
} from './ownership.js';

function uninstallManifest(text) {
  const manifest = validateManifest(text);
  // A newer ownership format needs an uninstaller that understands every recorded mutation.
  const settings = manifest.managedClientSettings;
  if (Object.keys(manifest).some((key) => !['framework', 'createdPaths', 'managedClientSettings', 'hooks'].includes(key))
      || Object.keys(settings).some((key) => key !== '.claude/settings.json')
      || Object.keys(settings['.claude/settings.json']).some((key) => key !== 'skillOverrides')) {
    throw new Error('Unsupported ownership records in .standards/INSTALLATION.json; use an uninstaller that understands them');
  }
  return manifest;
}

// Cycle records the roles wrote under `.standards/docs/`; uninstall deletes
// them with the runtime, so the preview warns with their count. Symlinks were
// already refused by verifyNormalDirectory.
async function countCycleRecords(root) {
  try {
    const entries = await readdir(path.join(root, '.standards', 'docs'), { recursive: true, withFileTypes: true });
    return entries.filter((entry) => entry.isFile() && entry.name.endsWith('.md')).length;
  } catch (error) {
    if (error.code === 'ENOENT' || error.code === 'ENOTDIR') return 0;
    throw error;
  }
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
      // Another project's skill may use a symlinked SKILL.md; it is not ours, so
      // skip it without reading through the link.
      if (!expected) {
        let skillEntry = null;
        try { skillEntry = await lstat(path.join(root, relative, 'SKILL.md')); } catch (error) {
          if (error.code !== 'ENOENT') throw error;
        }
        if (!skillEntry?.isFile()) continue;
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
  const relative = HOOK_FILES.claude;
  const owned = manifest.managedClientSettings[relative].skillOverrides;
  const created = manifest.createdPaths?.includes(relative) ?? false;
  const existing = await readProjectFile(root, relative);
  if (existing === null) return;
  const parsed = jsonObject(existing, relative);
  if (parsed.skillOverrides !== undefined
      && (!parsed.skillOverrides || typeof parsed.skillOverrides !== 'object'
        || Array.isArray(parsed.skillOverrides))) {
    throw new Error('Invalid skillOverrides in ' + relative + '; cannot compare recorded settings safely');
  }
  // STANDARDS hooks run a script inside .standards/, which is being removed.
  const { config: settings, found } = withoutStandardsHooks(parsed, relative);
  let changed = found;
  for (const [role, installedValue] of Object.entries(owned)) {
    if (!settings.skillOverrides || !Object.hasOwn(settings.skillOverrides, role)) continue;
    if (settings.skillOverrides[role] === installedValue) {
      delete settings.skillOverrides[role];
      changed = true;
    } else {
      warnings.push('Preserved changed setting: ' + relative + ' skillOverrides.' + role);
    }
  }
  const leftover = Object.keys(settings).filter((key) => key !== '$schema'
    && !(key === 'skillOverrides' && Object.keys(settings.skillOverrides ?? {}).length === 0));
  if (created && leftover.length === 0
      && [undefined, 'https://json.schemastore.org/claude-code-settings.json'].includes(settings.$schema)) {
    operations.push({ kind: 'remove', relative });
  } else if (changed) {
    // Keep existing files and created files with user-owned settings.
    operations.push({ kind: 'file', relative, contents: JSON.stringify(settings, null, 2) + '\n' });
  }
}

async function removeCodexHooks(root, manifest, operations) {
  const relative = HOOK_FILES.codex;
  const existing = await readProjectFile(root, relative);
  if (existing === null) return;
  const { config, found } = withoutStandardsHooks(jsonObject(existing, relative), relative);
  if ((manifest.createdPaths ?? []).includes(relative) && Object.keys(config).length === 0) {
    operations.push({ kind: 'remove', relative });
  } else if (found) {
    operations.push({ kind: 'file', relative, contents: JSON.stringify(config, null, 2) + '\n' });
  }
}

// Remove the managed block together with the blank line and trailing newline
// that install added around it, so the file returns to its original text.
export function removeBlock(text, range) {
  let before = text.slice(0, range.start);
  let after = text.slice(range.end);
  const newline = /^\r?\n/.exec(after);
  if (newline) {
    after = after.slice(newline[0].length);
    if (/\r?\n\r?\n$/.test(before)) before = before.replace(/\r?\n$/, '');
  }
  return before + after;
}

async function removeEmptyCreatedDirectories(root, manifest, operations) {
  const created = new Set(manifest.createdPaths ?? []);
  const planned = new Set(operations.filter((operation) => operation.kind === 'remove')
    .map((operation) => operation.relative));
  for (const relative of ['.agents/skills', '.claude/skills', '.agents', '.claude', '.codex']) {
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

export async function uninstallProject({ projectRoot, dryRun = false, expectedPlan = null }) {
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
    const contents = removeBlock(existing, range);
    operations.push(contents.trim()
      ? { kind: 'file', relative, contents }
      : { kind: 'remove', relative });
  }

  if (!runtime) {
    if (skills.paths.length > 0 || operations.length > 0) {
      throw new Error('Incomplete runtime: STANDARDS skills or integration blocks exist without .standards/INSTALLATION.json; cannot determine settings ownership');
    }
    return { clients: [], paths: [], changed: 0, warnings, operations: [] };
  }

  const records = await countCycleRecords(projectRoot);
  if (records > 0) {
    warnings.push(`Deletes ${records} cycle record${records === 1 ? '' : 's'} in .standards/docs/ (scope, design, `
      + 'development, verification, review, documentation, and synchronization records).');
  }
  await removeOwnedSettings(projectRoot, manifest, operations, warnings);
  await removeCodexHooks(projectRoot, manifest, operations);
  for (const relative of skills.paths) operations.push({ kind: 'remove', relative });
  await removeEmptyCreatedDirectories(projectRoot, manifest, operations);
  // Retain ownership information until all shared files and skills have been handled.
  operations.push({ kind: 'remove', relative: '.standards' });

  const paths = operations.map(({ kind, relative }) => ({
    action: kind === 'remove' ? 'remove' : 'update', path: relative,
  }));
  if (expectedPlan && (JSON.stringify(operations) !== JSON.stringify(expectedPlan.operations)
      || JSON.stringify(warnings) !== JSON.stringify(expectedPlan.warnings)
      || JSON.stringify(skills.clients) !== JSON.stringify(expectedPlan.clients))) {
    throw new Error('Project changed after the uninstall preview; review the new plan and try again');
  }
  const changed = dryRun ? 0 : await applyOperations(projectRoot, operations, {
    scratchPrefix: '.standards-uninstall-',
  });
  return { clients: skills.clients, paths, changed, warnings, operations };
}

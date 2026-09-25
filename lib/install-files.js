import { cp, lstat, mkdir, mkdtemp, readFile, readdir, rename, rm, rmdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

export async function inspectPath(root, relative) {
  let current = root;
  const parts = relative.split('/');
  for (let index = 0; index < parts.length; index += 1) {
    current = path.join(current, parts[index]);
    let entry;
    try {
      entry = await lstat(current);
    } catch (error) {
      if (error.code === 'ENOENT') return null;
      throw error;
    }
    if (entry.isSymbolicLink()) {
      throw new Error(`Refusing symbolic link in installer path: ${current}`);
    }
    if (index < parts.length - 1 && !entry.isDirectory()) {
      throw new Error(`Installer path parent is not a directory: ${current}`);
    }
    if (index === parts.length - 1) return entry;
  }
  return null;
}

export async function readProjectFile(root, relative) {
  const entry = await inspectPath(root, relative);
  if (!entry) return null;
  if (!entry.isFile()) throw new Error(`Expected a file: ${path.join(root, relative)}`);
  return readFile(path.join(root, relative), 'utf8');
}

async function treeEntries(directory, prefix = '') {
  const entries = new Map();
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relative = path.posix.join(prefix, entry.name);
    const absolute = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) {
      throw new Error(`Refusing symbolic link inside skill package: ${absolute}`);
    }
    if (entry.isDirectory()) {
      entries.set(relative, null);
      for (const [name, contents] of await treeEntries(absolute, relative)) entries.set(name, contents);
    } else if (entry.isFile()) {
      entries.set(relative, await readFile(absolute));
    } else {
      throw new Error(`Unsupported file inside skill package: ${absolute}`);
    }
  }
  return entries;
}

export async function verifyNormalDirectory(directory) {
  await treeEntries(directory);
}

export async function sameDirectory(source, destination) {
  const left = await treeEntries(source);
  const right = await treeEntries(destination);
  if (left.size !== right.size) return false;
  for (const [name, contents] of left) {
    if (!right.has(name)) return false;
    const other = right.get(name);
    if (contents === null ? other !== null : other === null || !contents.equals(other)) return false;
  }
  return true;
}

async function ensureParents(root, relative, created) {
  const parts = relative.split('/').slice(0, -1);
  let current = root;
  for (const part of parts) {
    current = path.join(current, part);
    let entry;
    try {
      entry = await lstat(current);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      await mkdir(current);
      created.add(current);
      continue;
    }
    if (!entry.isDirectory() || entry.isSymbolicLink()) {
      throw new Error(`Installer path parent is not a normal directory: ${current}`);
    }
  }
}

export async function applyOperations(root, operations) {
  if (operations.length === 0) return 0;
  const scratch = await mkdtemp(path.join(root, '.standards-install-'));
  const stages = [];
  const applied = [];
  const created = new Set();
  let rollbackFailed = false;
  try {
    for (let index = 0; index < operations.length; index += 1) {
      const staged = path.join(scratch, `stage-${index}`);
      const operation = operations[index];
      if (operation.kind === 'file') {
        await writeFile(staged, operation.contents);
      } else {
        await cp(operation.source, staged, { recursive: true, errorOnExist: true, force: false });
      }
      stages.push(staged);
    }

    for (let index = 0; index < operations.length; index += 1) {
      const operation = operations[index];
      const target = path.join(root, operation.relative);
      const backup = path.join(scratch, `backup-${index}`);
      const state = { target, backup, backedUp: false, installed: false };
      applied.push(state);
      await ensureParents(root, operation.relative, created);
      if (await inspectPath(root, operation.relative)) {
        await rename(target, backup);
        state.backedUp = true;
      }
      await rename(stages[index], target);
      state.installed = true;
    }
    return operations.length;
  } catch (error) {
    const rollbackErrors = [];
    for (const state of applied.reverse()) {
      try {
        if (state.installed) await rm(state.target, { recursive: true, force: true });
        if (state.backedUp) await rename(state.backup, state.target);
      } catch (rollbackError) {
        rollbackErrors.push(rollbackError.message);
      }
    }
    for (const directory of [...created].reverse()) {
      try {
        await rmdir(directory);
      } catch (cleanupError) {
        if (cleanupError.code !== 'ENOTEMPTY' && cleanupError.code !== 'ENOENT') {
          rollbackErrors.push(cleanupError.message);
        }
      }
    }
    if (rollbackErrors.length > 0) {
      rollbackFailed = true;
      throw new Error(`${error.message}; rollback incomplete: ${rollbackErrors.join('; ')}; backups remain at ${scratch}`);
    }
    throw error;
  } finally {
    // Keep backups if rollback failed, so the user can recover the originals.
    if (!rollbackFailed) await rm(scratch, { recursive: true, force: true });
  }
}

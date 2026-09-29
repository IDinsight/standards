import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { applyOperations, assertNoInterruptedTransaction, inspectPath, readProjectFile, sameDirectory, sourceFiles, verifyNormalDirectory } from './install-files.js';
import {
  MARKER, CLIENT_PATHS, HOOK_FILES, blockRange, jsonObject, standardsHandlers, validateManifest, withStandardsHooks,
  withoutStandardsHooks,
} from './ownership.js';
import { MODES } from '../runtime/lib/core.mjs';
import { modeFromFile, validateState } from '../runtime/lib/state.mjs';

const packageRoot = fileURLToPath(new URL('../', import.meta.url));
const sourcePath = (relative) => path.join(packageRoot, relative);
export const sourceText = (relative) => readFile(sourcePath(relative), 'utf8');
// Skill folders ship with evaluation scenarios for developing the skills; they
// are not installed into projects.
const NOT_INSTALLED = /^evals\//;

function versionParts(version, relative) {
  const match = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.exec(version);
  if (!match) throw new Error(`Invalid framework version in ${relative}`);
  return match.slice(1).map(BigInt);
}

export function validateVersion(text) {
  const relative = '.standards/VERSION.json';
  const value = jsonObject(text, relative);
  if (value.framework !== 'S.T.A.N.D.A.R.D.S.' || typeof value.version !== 'string') {
    throw new Error(`Invalid ${relative}`);
  }
  versionParts(value.version, relative);
  return value.version;
}

export function checkUpgrade(installed, incoming) {
  const before = versionParts(installed, '.standards/VERSION.json');
  const after = versionParts(incoming, 'package.json');
  if (before[0] !== after[0]) {
    throw new Error(`Cross-major upgrade from ${installed} to ${incoming} is unsupported. STANDARDS has no `
      + 'migration between major versions. To move to the new version, run `standards uninstall` (this deletes '
      + '.standards/, including workflow state, Auditor context, cycle records, and user styles), then '
      + 'install again.');
  }
  for (let index = 0; index < before.length; index += 1) {
    if (after[index] > before[index]) return;
    if (after[index] < before[index]) {
      throw new Error(`Downgrade from ${installed} to ${incoming} is unsupported`);
    }
  }
}

function mergeBlock(existing, template, relative, warnings) {
  if (existing === null) return template;
  const range = blockRange(existing, relative);
  const outside = range ? existing.slice(0, range.start) + existing.slice(range.end) : existing;
  if (relative === 'CLAUDE.md') {
    const imports = outside.split(/\r?\n/).filter((line) => /^\s*@AGENTS\.md\s*$/.test(line));
    if (imports.length > 0) {
      if (imports.length > 1) warnings.push('CLAUDE.md has multiple user-owned @AGENTS.md imports');
      return range ? outside : existing;
    }
  }
  const newline = existing.includes('\r\n') ? '\r\n' : '\n';
  const block = template.trimEnd().replace(/\n/g, newline);
  if (range) return existing.slice(0, range.start) + block + existing.slice(range.end);
  return existing + (existing.endsWith('\n') ? newline : newline + newline) + block + newline;
}

export async function loadAssets() {
  const packageJson = jsonObject(await sourceText('package.json'), 'package.json');
  const version = packageJson.version;
  versionParts(version, 'package.json');
  const protocol = await sourceText('PROTOCOL.md');
  if (!protocol.includes(MARKER)) throw new Error('Source PROTOCOL.md lacks ownership marker');
  const roles = (await readdir(sourcePath('skills'), { withFileTypes: true }))
    .filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  if (roles.length === 0) throw new Error('No framework skills were packaged');
  await verifyNormalDirectory(sourcePath('runtime'));
  if ((await readdir(sourcePath('runtime'))).every((name) => name !== 'check.mjs')) {
    throw new Error('Runtime tools were not packaged');
  }
  await verifyNormalDirectory(sourcePath('protocol'));
  if (!(await readdir(sourcePath('protocol'))).some((name) => name.endsWith('.md'))) {
    throw new Error('Protocol chapters were not packaged');
  }
  for (const role of roles) {
    await verifyNormalDirectory(sourcePath(`skills/${role}`));
    if (!(await sourceText(`skills/${role}/SKILL.md`)).includes(MARKER)) {
      throw new Error(`Source skill lacks ownership marker: ${role}`);
    }
    const adapter = await sourceText(`skills/${role}/agents/openai.yaml`);
    if (!/^\s*allow_implicit_invocation:\s*false\s*$/m.test(adapter)) {
      throw new Error(`Codex adapter permits implicit invocation: ${role}`);
    }
  }
  return { protocol, roles, version };
}

async function loadRuntime(root) {
  const entry = await inspectPath(root, '.standards');
  if (!entry) return null;
  if (!entry.isDirectory()) throw new Error('Path collision: .standards is not a directory');
  const protocol = await readProjectFile(root, '.standards/PROTOCOL.md');
  if (!protocol?.includes(MARKER)) throw new Error('Path collision: .standards is not framework-owned');
  const files = {};
  for (const name of ['VERSION.json', 'INSTALLATION.json', 'MODE.md', 'STATE.md']) {
    files[name] = await readProjectFile(root, `.standards/${name}`);
    if (files[name] === null) throw new Error(`Incomplete runtime: missing .standards/${name}`);
  }
  const state = validateState(files['STATE.md']);
  const mode = modeFromFile(files['MODE.md']);
  if (mode === 'GREENFIELD' && (state.cycleMode === 'EXPEDITED' || state.pendingMode === 'EXPEDITED')) {
    throw new Error('Inconsistent runtime: GREENFIELD cannot use EXPEDITED cycle mode');
  }
  return { manifest: validateManifest(files['INSTALLATION.json']),
    version: validateVersion(files['VERSION.json']), mode };
}

async function findInstalledClients(root, roles, runtimeExists) {
  const installed = [];
  for (const [client, base] of Object.entries(CLIENT_PATHS)) {
    let count = 0;
    for (const role of roles) {
      const relative = `${base}/${role}`;
      const entry = await inspectPath(root, relative);
      if (!entry) continue;
      if (!entry.isDirectory()) throw new Error(`Skill collision: ${relative} is not a directory`);
      const skill = await readProjectFile(root, `${relative}/SKILL.md`);
      if (!skill?.includes(MARKER)) throw new Error(`Skill collision: ${relative} is not framework-owned`);
      count += 1;
    }
    if (count > 0 && !runtimeExists) throw new Error(`Incomplete runtime: skills in ${base} without .standards`);
    if (count > 0 && count !== roles.length) throw new Error(`Incomplete runtime: partial skills in ${base}`);
    if (count > 0) installed.push(client);
  }
  if (runtimeExists && installed.length === 0) throw new Error('Incomplete runtime: no client skills found');
  return installed;
}

// GREENFIELD when the project holds nothing but metadata: version control,
// editor and coding-agent settings, the STANDARDS runtime, and the usual
// top-level project files.
export async function inferMode(root) {
  const ignored = new Set([
    '.git', '.github', '.gitignore', '.DS_Store', '.idea', '.vscode', 'node_modules',
    '.agents', '.claude', '.codex', '.standards',
    '.editorconfig', '.prettierrc', '.prettierrc.json', 'tsconfig.json',
    'README.md', 'LICENSE', 'LICENSE.md', 'CHANGELOG.md', 'CONTRIBUTING.md',
    'CODE_OF_CONDUCT.md', 'AGENTS.md', 'CLAUDE.md', 'package.json',
    'package-lock.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml', 'yarn.lock',
    'pyproject.toml', 'Cargo.toml', 'Cargo.lock', 'go.mod', 'go.sum',
  ]);
  return (await readdir(root)).some((name) => !ignored.has(name)) ? 'BROWNFIELD' : 'GREENFIELD';
}

const sameJson = (left, right) => JSON.stringify(left) === JSON.stringify(right);

// Put the STANDARDS hook groups in place, or take them out when hooks are off.
// Returns the updated config and whether hooks the installer had recorded were
// missing or edited (and are being restored).
async function applyHooks(config, relative, { enabled, recorded, sameVersion }) {
  const template = jsonObject(await sourceText(relative === HOOK_FILES.claude
    ? 'templates/claude/settings-hooks.json' : 'templates/codex/.codex/hooks.json'), relative);
  const { config: without } = withoutStandardsHooks(config, relative);
  if (!enabled) return { config: without, restored: false };
  const next = withStandardsHooks(without, template);
  if (sameJson(next, config)) return { config, restored: false };
  // Within the same version the template is unchanged, so a difference means
  // the recorded hooks were removed or edited after install.
  return { config: next, restored: recorded && sameVersion
    && !sameJson(standardsHandlers(config), standardsHandlers(template)) };
}

async function mergeClaudeSettings(root, manifest, roles, hooks, restored) {
  const relative = HOOK_FILES.claude;
  const existing = await readProjectFile(root, relative);
  const original = existing === null
    ? jsonObject(await sourceText('templates/claude/.claude/settings.json'), relative)
    : jsonObject(existing, relative);
  const settings = structuredClone(original);
  if (settings.skillOverrides === undefined) settings.skillOverrides = {};
  if (!settings.skillOverrides || typeof settings.skillOverrides !== 'object'
      || Array.isArray(settings.skillOverrides)) throw new Error(`Invalid skillOverrides in ${relative}`);
  const owned = manifest.managedClientSettings[relative].skillOverrides;
  for (const role of roles) {
    const current = settings.skillOverrides[role];
    if (owned[role]) {
      // An installer-owned setting that was changed or removed is put back.
      if (current !== owned[role]) {
        restored.push(`${relative} skillOverrides.${role} (${current === undefined ? 'missing' : `was ${JSON.stringify(current)}`})`);
        settings.skillOverrides[role] = owned[role];
      }
    } else if (current === undefined) {
      settings.skillOverrides[role] = 'user-invocable-only';
      owned[role] = 'user-invocable-only';
    } else if (current !== 'user-invocable-only') {
      throw new Error(`Conflicting ${relative} skillOverrides.${role}: ${JSON.stringify(current)}`);
    }
  }
  const result = await applyHooks(settings, relative, hooks);
  if (result.restored) restored.push(`STANDARDS hooks in ${relative}`);
  return existing !== null && sameJson(original, result.config)
    ? existing : `${JSON.stringify(result.config, null, 2)}\n`;
}

async function mergeCodexHooks(root, hooks, restored) {
  const relative = HOOK_FILES.codex;
  const existing = await readProjectFile(root, relative);
  if (existing === null && !hooks.enabled) return null;
  const original = existing === null ? {} : jsonObject(existing, relative);
  const result = await applyHooks(original, relative, hooks);
  if (result.restored) restored.push(`STANDARDS hooks in ${relative}`);
  return existing !== null && sameJson(original, result.config)
    ? existing : `${JSON.stringify(result.config, null, 2)}\n`;
}

// What an interactive install should offer as defaults: the installed mode,
// clients, and hook choice for an existing runtime.
export async function inspectInstallTarget(projectRoot) {
  await assertNoInterruptedTransaction(projectRoot);
  const runtime = await loadRuntime(projectRoot);
  const { roles } = await loadAssets();
  return {
    mode: runtime?.mode ?? await inferMode(projectRoot),
    installed: Boolean(runtime),
    clients: runtime ? await findInstalledClients(projectRoot, roles, true) : [],
    hooks: runtime ? (runtime.manifest.hooks?.length ?? 0) > 0 : true,
  };
}

// Build the full install plan without writing anything. `clients` and `hooks`
// default to the current installation (or both clients and hooks on a first
// install); clients already installed always stay installed.
export async function planInstallProject({ projectRoot, clients = null, mode = null, hooks = null }) {
  if (clients !== null && (!Array.isArray(clients) || clients.length === 0
      || clients.some((client) => !CLIENT_PATHS[client]))) {
    throw new Error('Unsupported client selection');
  }
  if (mode !== null && !MODES.has(mode)) throw new Error(`Unsupported mode: ${mode}`);
  if (hooks !== null && typeof hooks !== 'boolean') throw new Error('Unsupported hooks selection');
  await assertNoInterruptedTransaction(projectRoot);
  const assets = await loadAssets();
  const runtime = await loadRuntime(projectRoot);
  if (runtime) checkUpgrade(runtime.version, assets.version);
  const priorClients = await findInstalledClients(projectRoot, assets.roles, Boolean(runtime));
  const allClients = [...new Set([...priorClients, ...(clients ?? (runtime ? [] : ['codex', 'claude']))])];
  const projectMode = runtime?.mode ?? mode ?? await inferMode(projectRoot);
  if (runtime && mode !== null && mode !== runtime.mode) {
    throw new Error(`Existing project mode is ${runtime.mode}; installer cannot change it to ${mode}`);
  }
  const manifest = runtime?.manifest
    ?? validateManifest(await sourceText('templates/common/.standards/INSTALLATION.json'));
  const recordedHooks = new Set(manifest.hooks ?? []);
  const hooksEnabled = hooks ?? (runtime ? recordedHooks.size > 0 : true);

  async function recordCreatedPath(relative) {
    if (await inspectPath(projectRoot, relative)) return;
    if (!manifest.createdPaths) manifest.createdPaths = [];
    if (!manifest.createdPaths.includes(relative)) manifest.createdPaths.push(relative);
  }

  const warnings = [];
  const restored = [];
  const notices = [];
  const operations = [];
  async function queueFile(relative, contents) {
    if (await readProjectFile(projectRoot, relative) !== contents) {
      operations.push({ kind: 'file', relative, contents });
    }
  }
  async function queueDirectory(relative, from) {
    const entry = await inspectPath(projectRoot, relative);
    if (entry && !entry.isDirectory()) throw new Error(`Expected a directory: ${relative}`);
    if (!entry || !(await sameDirectory(from, path.join(projectRoot, relative)))) {
      operations.push({ kind: 'directory', relative, source: from });
    }
  }
  // Skill folders are updated file by file, so files a user added to an
  // installed skill folder survive a reinstall or upgrade.
  async function queueSkill(relative, from) {
    const entry = await inspectPath(projectRoot, relative);
    if (entry && !entry.isDirectory()) throw new Error(`Skill collision: ${relative} is not a directory`);
    for (const [file, contents] of await sourceFiles(from)) {
      if (NOT_INSTALLED.test(file)) continue;
      const target = `${relative}/${file}`;
      const text = contents.toString('utf8');
      if (await readProjectFile(projectRoot, target) !== text) {
        operations.push({ kind: 'file', relative: target, contents: text, skill: relative, newSkill: !entry });
      }
    }
  }
  const hookOptions = (relative) => ({
    enabled: hooksEnabled, recorded: recordedHooks.has(relative), sameVersion: runtime?.version === assets.version,
  });

  const agents = await readProjectFile(projectRoot, 'AGENTS.md');
  await queueFile('AGENTS.md', mergeBlock(agents, await sourceText('templates/common/AGENTS.md'), 'AGENTS.md', warnings));
  const claude = await readProjectFile(projectRoot, 'CLAUDE.md');
  await queueFile('CLAUDE.md', mergeBlock(claude, await sourceText('templates/common/CLAUDE.md'), 'CLAUDE.md', warnings));
  for (const client of allClients) {
    const base = CLIENT_PATHS[client];
    await recordCreatedPath(base.split('/')[0]);
    await recordCreatedPath(base);
    for (const role of assets.roles) {
      await queueSkill(`${base}/${role}`, sourcePath(`skills/${role}`));
    }
  }
  if (allClients.includes('claude')) {
    await recordCreatedPath(HOOK_FILES.claude);
    await queueFile(HOOK_FILES.claude, await mergeClaudeSettings(projectRoot, manifest, assets.roles,
      hookOptions(HOOK_FILES.claude), restored));
  }
  if (allClients.includes('codex')) {
    const contents = await mergeCodexHooks(projectRoot, hookOptions(HOOK_FILES.codex), restored);
    if (contents !== null) {
      await recordCreatedPath('.codex');
      await recordCreatedPath(HOOK_FILES.codex);
      const before = operations.length;
      await queueFile(HOOK_FILES.codex, contents);
      if (hooksEnabled && operations.length > before) {
        notices.push('Codex runs new or changed hooks only after you trust them: open Codex in this project and run /hooks.');
      }
    }
  }
  manifest.hooks = hooksEnabled ? allClients.map((client) => HOOK_FILES[client]) : [];
  await queueFile('.standards/INSTALLATION.json', `${JSON.stringify(manifest, null, 2)}\n`);
  if (!runtime) {
    await queueFile('.standards/MODE.md', await sourceText(`templates/${projectMode.toLowerCase()}/.standards/MODE.md`));
    await queueFile('.standards/STATE.md', await sourceText(`templates/${projectMode.toLowerCase()}/.standards/STATE.md`));
  }
  // Tools the agent runs from `.standards/bin/`; replaced as a whole on upgrade.
  await queueDirectory('.standards/bin', sourcePath('runtime'));
  // Chapters the protocol's reading guide names for specific situations;
  // replaced as a whole on upgrade, like the tools.
  await queueDirectory('.standards/protocol', sourcePath('protocol'));
  await queueFile('.standards/VERSION.json', `${JSON.stringify({
    framework: 'S.T.A.N.D.A.R.D.S.', version: assets.version,
  }, null, 2)}\n`);
  // Make the runtime ownership marker visible only after the other planned files.
  await queueFile('.standards/PROTOCOL.md', assets.protocol);
  // One preview line per skill folder instead of one per file.
  const paths = [];
  for (const operation of operations) {
    const entry = operation.skill
      ? { action: operation.newSkill ? 'install skill' : 'update skill', path: operation.skill }
      : { action: operation.kind !== 'directory' ? 'write'
        : operation.relative === '.standards/bin' ? 'install tools' : 'install protocol chapters',
      path: operation.relative };
    if (!paths.some((item) => item.path === entry.path)) paths.push(entry);
  }
  return { action: runtime ? (operations.length ? 'Updated' : 'Verified') : 'Installed',
    version: assets.version, mode: projectMode, clients: allClients, hooks: hooksEnabled, paths, warnings,
    restored, notices, operations };
}

export async function installProject({ projectRoot, clients = null, mode = null, hooks = null,
  expectedPlan = null }) {
  const plan = await planInstallProject({ projectRoot, clients, mode, hooks });
  if (expectedPlan && JSON.stringify(plan) !== JSON.stringify(expectedPlan)) {
    throw new Error('Project changed after the install preview; review the new plan and try again');
  }
  const changed = await applyOperations(projectRoot, plan.operations);
  const result = { ...plan, changed };
  delete result.operations;
  return result;
}

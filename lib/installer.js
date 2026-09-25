import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { applyOperations, assertNoInterruptedTransaction, inspectPath, readProjectFile, sameDirectory, verifyNormalDirectory } from './install-files.js';
import { MARKER, CLIENT_PATHS, jsonObject, validateManifest, blockRange } from './ownership.js';

const packageRoot = fileURLToPath(new URL('../', import.meta.url));
const MODES = new Set(['GREENFIELD', 'BROWNFIELD']);
const STATES = new Set([
  'SCOPING', 'ARCHITECTING', 'AUDITING', 'DEVELOPING', 'TESTING',
  'REVIEWING_IMPLEMENTATION', 'DOCUMENTING', 'REVIEWING_FINAL',
  'SYNCHRONIZING', 'AWAITING_USER_SIGNOFF', 'SIGNED_OFF', 'CANCELLED',
]);

const sourcePath = (relative) => path.join(packageRoot, relative);
const sourceText = (relative) => readFile(sourcePath(relative), 'utf8');

function versionParts(version, relative) {
  const match = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.exec(version);
  if (!match) throw new Error(`Invalid framework version in ${relative}`);
  return match.slice(1).map(BigInt);
}

function validateVersion(text) {
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
    throw new Error(`Cross-major upgrade from ${installed} to ${incoming} is unsupported; use an explicit migration process`);
  }
  for (let index = 0; index < before.length; index += 1) {
    if (after[index] > before[index]) return;
    if (after[index] < before[index]) {
      throw new Error(`Downgrade from ${installed} to ${incoming} is unsupported`);
    }
  }
}

function field(text, name, relative) {
  const values = [...text.matchAll(new RegExp('`' + name + '`:\\s*`([^`]+)`', 'g'))];
  if (values.length !== 1) throw new Error(`Invalid or missing ${name} in ${relative}`);
  return values[0][1];
}

function stateSection(text, name) {
  const heading = `## ${name}`;
  const start = text.indexOf(heading);
  if (start === -1 || text.indexOf(heading, start + heading.length) !== -1) {
    throw new Error(`Missing or repeated ${name} in .standards/STATE.md`);
  }
  const next = text.indexOf('\n## ', start + heading.length);
  return text.slice(start + heading.length, next === -1 ? undefined : next);
}

function validateState(text) {
  const relative = '.standards/STATE.md';
  if (!text.startsWith('# S.T.A.N.D.A.R.D.S. Workflow State')) {
    throw new Error(`Invalid ${relative} header`);
  }
  const head = text.slice(0, text.indexOf('## Active Work'));
  const workflowState = field(head, 'WorkflowState', relative);
  const cycleMode = field(head, 'CycleMode', relative);
  if (!STATES.has(workflowState)) throw new Error(`Invalid WorkflowState in ${relative}`);
  if (!new Set(['UNSET', 'STANDARD', 'EXPEDITED']).has(cycleMode)) {
    throw new Error(`Invalid CycleMode in ${relative}`);
  }
  const pendingMode = field(head, 'PendingCycleMode', relative);
  const pendingRequest = field(head, 'PendingCycleRequest', relative);
  const pendingBlockedOn = field(head, 'PendingCycleBlockedOn', relative);
  if (!new Set(['UNSET', 'STANDARD', 'EXPEDITED']).has(pendingMode)
      || (pendingRequest === 'UNSET') !== (pendingBlockedOn === 'NONE')
      || (['SIGNED_OFF', 'CANCELLED'].includes(workflowState) && cycleMode !== 'UNSET')) {
    throw new Error(`Inconsistent cycle or pending fields in ${relative}`);
  }
  const active = stateSection(text, 'Active Work');
  const activeFields = active.slice(0, active.indexOf('`BaselineReconciliation`:'));
  const id = field(activeFields, 'Id', relative);
  for (const name of ['Request', 'Scope', 'Architecture', 'Development', 'PromotionReason', 'AuditTarget', 'BlockedOn']) {
    field(activeFields, name, relative);
  }
  if (!active.includes('`BaselineReconciliation`:')) throw new Error(`Missing BaselineReconciliation in ${relative}`);
  const handoff = stateSection(text, 'Handoff');
  for (const name of ['Kind', 'From', 'FailureType', 'Reason']) {
    if (!new RegExp('`' + name + '`:\\s*`[^`]+`').test(handoff)) {
      throw new Error(`Invalid or missing Handoff.${name} in ${relative}`);
    }
  }
  for (const name of ['Recovery', 'Outstanding Obligations']) {
    if (!['true', 'false'].includes(field(stateSection(text, name), 'Active', relative))) {
      throw new Error(`Invalid ${name}.Active in ${relative}`);
    }
  }
  return { cycleMode, pendingMode, id };
}

function validateRegistry(text) {
  const lines = text.split(/\r?\n/);
  if (lines[0] !== '# S.T.A.N.D.A.R.D.S. Cycle ID Registry') {
    throw new Error('Invalid .standards/CYCLE_IDS.md header');
  }
  const ids = new Set();
  let inComment = false;
  for (const raw of lines.slice(1)) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith('<!--')) inComment = true;
    if (inComment) {
      if (line.includes('-->')) inComment = false;
      continue;
    }
    const match = /^- ([A-Za-z0-9][A-Za-z0-9._-]*)$/.exec(line);
    if (!match || ids.has(match[1])) throw new Error('Invalid or duplicate ID in .standards/CYCLE_IDS.md');
    ids.add(match[1]);
  }
  if (inComment) throw new Error('Unclosed comment in .standards/CYCLE_IDS.md');
  return ids;
}

function modeFromFile(text) {
  const mode = field(text, 'ProjectMode', '.standards/MODE.md');
  if (!MODES.has(mode)) throw new Error('Invalid ProjectMode in .standards/MODE.md');
  return mode;
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

async function loadAssets() {
  const packageJson = jsonObject(await sourceText('package.json'), 'package.json');
  const version = packageJson.version;
  versionParts(version, 'package.json');
  const protocol = await sourceText('PROTOCOL.md');
  if (!protocol.includes(MARKER)) throw new Error('Source PROTOCOL.md lacks ownership marker');
  const roles = (await readdir(sourcePath('skills'), { withFileTypes: true }))
    .filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  if (roles.length === 0) throw new Error('No framework skills were packaged');
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
  for (const name of ['VERSION.json', 'INSTALLATION.json', 'CYCLE_IDS.md', 'MODE.md', 'STATE.md']) {
    files[name] = await readProjectFile(root, `.standards/${name}`);
    if (files[name] === null) throw new Error(`Incomplete runtime: missing .standards/${name}`);
  }
  const registeredIds = validateRegistry(files['CYCLE_IDS.md']);
  const state = validateState(files['STATE.md']);
  const mode = modeFromFile(files['MODE.md']);
  if (state.id !== 'UNSET' && !registeredIds.has(state.id)) {
    throw new Error('Incomplete runtime: active cycle ID is absent from .standards/CYCLE_IDS.md');
  }
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

async function inferMode(root) {
  const ignored = new Set([
    '.git', '.github', '.gitignore', '.DS_Store', '.idea', '.vscode', 'node_modules',
    '.editorconfig', '.prettierrc', '.prettierrc.json', 'tsconfig.json',
    'README.md', 'LICENSE', 'LICENSE.md', 'CHANGELOG.md', 'CONTRIBUTING.md',
    'CODE_OF_CONDUCT.md', 'AGENTS.md', 'CLAUDE.md', 'package.json',
    'package-lock.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml', 'yarn.lock',
    'pyproject.toml', 'Cargo.toml', 'Cargo.lock', 'go.mod', 'go.sum',
  ]);
  return (await readdir(root)).some((name) => !ignored.has(name)) ? 'BROWNFIELD' : 'GREENFIELD';
}

async function verifyOwnedSettings(root, manifest) {
  const relative = '.claude/settings.json';
  const owned = manifest.managedClientSettings[relative].skillOverrides;
  if (Object.keys(owned).length === 0) return;
  const contents = await readProjectFile(root, relative);
  if (contents === null) throw new Error(`Incomplete runtime: missing owned ${relative}`);
  const settings = jsonObject(contents, relative);
  for (const [role, value] of Object.entries(owned)) {
    if (settings.skillOverrides?.[role] !== value) {
      throw new Error(`Incomplete runtime: owned ${relative} skillOverrides.${role} changed`);
    }
  }
}

async function mergeClaudeSettings(root, manifest, roles) {
  const relative = '.claude/settings.json';
  const existing = await readProjectFile(root, relative);
  const settings = existing === null
    ? { ...jsonObject(await sourceText('templates/claude/.claude/settings.json'), relative), skillOverrides: {} }
    : jsonObject(existing, relative);
  if (settings.skillOverrides === undefined) settings.skillOverrides = {};
  if (!settings.skillOverrides || typeof settings.skillOverrides !== 'object'
      || Array.isArray(settings.skillOverrides)) throw new Error(`Invalid skillOverrides in ${relative}`);
  const owned = manifest.managedClientSettings[relative].skillOverrides;
  let added = false;
  for (const role of roles) {
    const current = settings.skillOverrides[role];
    if (current === undefined) {
      settings.skillOverrides[role] = 'user-invocable-only';
      owned[role] = 'user-invocable-only';
      added = true;
    } else if (current !== 'user-invocable-only') {
      throw new Error(`Conflicting ${relative} skillOverrides.${role}: ${JSON.stringify(current)}`);
    }
  }
  return { contents: added || existing === null ? `${JSON.stringify(settings, null, 2)}\n` : existing,
  };
}

export async function inspectInstallTarget(projectRoot) {
  await assertNoInterruptedTransaction(projectRoot);
  const runtime = await loadRuntime(projectRoot);
  return { mode: runtime?.mode ?? await inferMode(projectRoot), installed: Boolean(runtime) };
}

export async function planInstallProject({ projectRoot, clients = ['codex', 'claude'], mode = null }) {
  if (!Array.isArray(clients) || clients.length === 0 || clients.some((client) => !CLIENT_PATHS[client])) {
    throw new Error('Unsupported client selection');
  }
  if (mode !== null && !MODES.has(mode)) throw new Error(`Unsupported mode: ${mode}`);
  await assertNoInterruptedTransaction(projectRoot);
  const assets = await loadAssets();
  const runtime = await loadRuntime(projectRoot);
  if (runtime) checkUpgrade(runtime.version, assets.version);
  const priorClients = await findInstalledClients(projectRoot, assets.roles, Boolean(runtime));
  const allClients = [...new Set([...priorClients, ...clients])];
  const projectMode = runtime?.mode ?? mode ?? await inferMode(projectRoot);
  if (runtime && mode !== null && mode !== runtime.mode) {
    throw new Error(`Existing project mode is ${runtime.mode}; installer cannot change it to ${mode}`);
  }
  const manifest = runtime?.manifest
    ?? validateManifest(await sourceText('templates/common/.standards/INSTALLATION.json'));
  await verifyOwnedSettings(projectRoot, manifest);

  async function recordCreatedPath(relative) {
    if (await inspectPath(projectRoot, relative)) return;
    if (!manifest.createdPaths) manifest.createdPaths = [];
    if (!manifest.createdPaths.includes(relative)) manifest.createdPaths.push(relative);
  }

  const warnings = [];
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

  const agents = await readProjectFile(projectRoot, 'AGENTS.md');
  await queueFile('AGENTS.md', mergeBlock(agents, await sourceText('templates/common/AGENTS.md'), 'AGENTS.md', warnings));
  const claude = await readProjectFile(projectRoot, 'CLAUDE.md');
  await queueFile('CLAUDE.md', mergeBlock(claude, await sourceText('templates/common/CLAUDE.md'), 'CLAUDE.md', warnings));
  for (const client of allClients) {
    const base = CLIENT_PATHS[client];
    await recordCreatedPath(base.split('/')[0]);
    await recordCreatedPath(base);
    for (const role of assets.roles) {
      await queueDirectory(`${base}/${role}`, sourcePath(`skills/${role}`));
    }
  }
  if (allClients.includes('claude')) {
    await recordCreatedPath('.claude/settings.json');
    const prepared = await mergeClaudeSettings(projectRoot, manifest, assets.roles);
    await queueFile('.claude/settings.json', prepared.contents);
  }
  await queueFile('.standards/INSTALLATION.json', `${JSON.stringify(manifest, null, 2)}\n`);
  if (!runtime) {
    await queueFile('.standards/CYCLE_IDS.md', await sourceText('templates/common/.standards/CYCLE_IDS.md'));
    await queueFile('.standards/MODE.md', await sourceText(`templates/${projectMode.toLowerCase()}/.standards/MODE.md`));
    await queueFile('.standards/STATE.md', await sourceText(`templates/${projectMode.toLowerCase()}/.standards/STATE.md`));
  }
  await queueFile('.standards/VERSION.json', `${JSON.stringify({
    framework: 'S.T.A.N.D.A.R.D.S.', version: assets.version,
  }, null, 2)}\n`);
  // Make the runtime ownership marker visible only after the other planned files.
  await queueFile('.standards/PROTOCOL.md', assets.protocol);
  const paths = operations.map(({ kind, relative }) => ({
    action: kind === 'directory' ? 'install skill' : 'write', path: relative,
  }));
  return { action: runtime ? (operations.length ? 'Updated' : 'Verified') : 'Installed',
    version: assets.version, mode: projectMode, clients: allClients, paths, warnings,
    operations };
}

export async function installProject({ projectRoot, clients = ['codex', 'claude'], mode = null,
  expectedPlan = null }) {
  const plan = await planInstallProject({ projectRoot, clients, mode });
  if (expectedPlan && JSON.stringify(plan) !== JSON.stringify(expectedPlan)) {
    throw new Error('Project changed after the install preview; review the new plan and try again');
  }
  const changed = await applyOperations(projectRoot, plan.operations);
  const { operations, ...result } = plan;
  return { ...result, changed };
}

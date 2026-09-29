export const MARKER = '<!-- standards:framework-owned -->';
export const END = '<!-- standards:end -->';
export const CLIENT_PATHS = { codex: '.agents/skills', claude: '.claude/skills' };
export const TRACKED_CREATED_PATHS = new Set([
  '.agents', '.agents/skills', '.claude', '.claude/skills', '.claude/settings.json', '.codex', '.codex/hooks.json',
]);
// Hook files per client, and the script every STANDARDS hook runs. A hook
// handler whose command runs this script belongs to STANDARDS: the script lives
// in the framework-owned `.standards/bin/`, so nothing else points at it.
export const HOOK_FILES = { claude: '.claude/settings.json', codex: '.codex/hooks.json' };
export const HOOK_SCRIPT = '.standards/bin/hook.mjs';

const isObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

export function jsonObject(text, relative) {
  let value;
  try { value = JSON.parse(text); } catch (error) {
    throw new Error(`Invalid JSON in ${relative}: ${error.message}`, { cause: error });
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Expected JSON object in ${relative}`);
  }
  return value;
}

export function validateManifest(text) {
  const manifest = jsonObject(text, '.standards/INSTALLATION.json');
  const settings = manifest.managedClientSettings;
  const entry = settings?.['.claude/settings.json'];
  const owned = entry?.skillOverrides;
  if (manifest.framework !== 'S.T.A.N.D.A.R.D.S.'
      || !settings || typeof settings !== 'object' || Array.isArray(settings)
      || !entry || typeof entry !== 'object' || Array.isArray(entry)
      || !owned || typeof owned !== 'object' || Array.isArray(owned)) {
    throw new Error('Invalid .standards/INSTALLATION.json');
  }
  for (const [role, value] of Object.entries(owned)) {
    if (!role || value !== 'user-invocable-only') {
      throw new Error(`Invalid owned Claude setting: ${role}`);
    }
  }
  const hookFiles = new Set(Object.values(HOOK_FILES));
  if (manifest.hooks !== undefined && (!Array.isArray(manifest.hooks)
      || manifest.hooks.some((item) => !hookFiles.has(item)) || new Set(manifest.hooks).size !== manifest.hooks.length)) {
    throw new Error('Invalid hooks in .standards/INSTALLATION.json');
  }
  if (manifest.createdPaths !== undefined) {
    if (!Array.isArray(manifest.createdPaths)
        || manifest.createdPaths.some((item) => !TRACKED_CREATED_PATHS.has(item))
        || new Set(manifest.createdPaths).size !== manifest.createdPaths.length) {
      throw new Error('Invalid createdPaths in .standards/INSTALLATION.json');
    }
  }
  return manifest;
}

export function blockRange(text, relative) {
  const starts = [...text.matchAll(/<!-- standards:start -->/g)];
  const ends = [...text.matchAll(/<!-- standards:end -->/g)];
  if (starts.length !== ends.length || starts.length > 1
      || (starts.length === 1 && starts[0].index > ends[0].index)) {
    throw new Error(`Invalid STANDARDS block in ${relative}`);
  }
  return starts.length === 0 ? null : { start: starts[0].index, end: ends[0].index + END.length };
}

function isStandardsHandler(handler) {
  return isObject(handler) && typeof handler.command === 'string' && handler.command.includes(HOOK_SCRIPT);
}

// Remove every STANDARDS hook handler from a Claude settings or Codex hooks
// object, dropping groups and events left empty. Other hooks are kept as they
// are. Returns the original object when it had no STANDARDS handlers.
export function withoutStandardsHooks(config, relative) {
  if (config.hooks === undefined) return { config, found: false };
  if (!isObject(config.hooks)) throw new Error(`Invalid hooks in ${relative}`);
  const hooks = {};
  let found = false;
  for (const [event, groups] of Object.entries(config.hooks)) {
    if (!Array.isArray(groups)) throw new Error(`Invalid hooks.${event} in ${relative}`);
    const kept = [];
    for (const group of groups) {
      if (!isObject(group) || !Array.isArray(group.hooks)) {
        kept.push(group);
        continue;
      }
      const handlers = group.hooks.filter((handler) => !isStandardsHandler(handler));
      if (handlers.length === group.hooks.length) kept.push(group);
      else {
        found = true;
        if (handlers.length) kept.push({ ...group, hooks: handlers });
      }
    }
    if (kept.length) hooks[event] = kept;
  }
  if (!found) return { config, found };
  const next = { ...config, hooks };
  if (Object.keys(hooks).length === 0) delete next.hooks;
  return { config: next, found };
}

// Add the STANDARDS hook groups from a template after any existing groups.
export function withStandardsHooks(config, template) {
  const hooks = { ...(config.hooks ?? {}) };
  for (const [event, groups] of Object.entries(template.hooks)) hooks[event] = [...(hooks[event] ?? []), ...groups];
  return { ...config, hooks };
}

export function standardsHandlers(config) {
  return Object.values(isObject(config.hooks) ? config.hooks : {})
    .flatMap((groups) => (Array.isArray(groups) ? groups : []))
    .flatMap((group) => (isObject(group) && Array.isArray(group.hooks) ? group.hooks : []))
    .filter(isStandardsHandler);
}

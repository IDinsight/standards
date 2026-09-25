export const MARKER = '<!-- standards:framework-owned -->';
export const END = '<!-- standards:end -->';
export const CLIENT_PATHS = { codex: '.agents/skills', claude: '.claude/skills' };
export const TRACKED_CREATED_PATHS = new Set([
  '.agents', '.agents/skills', '.claude', '.claude/skills', '.claude/settings.json',
]);

export function jsonObject(text, relative) {
  let value;
  try { value = JSON.parse(text); } catch (error) {
    throw new Error(`Invalid JSON in ${relative}: ${error.message}`);
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

const ORDER = ['added', 'changed', 'fixed', 'removed'];

export function groupEntries(entries) {
  const groups = new Map(ORDER.map((type) => [type, []]));
  for (const entry of entries) {
    if (!groups.has(entry.type)) throw new Error(`unknown entry type: ${entry.type}`);
    groups.get(entry.type).push(entry.text.trim());
  }
  return groups;
}

export function renderNotes(version, entries) {
  const lines = [`## ${version}`, ''];
  for (const [type, texts] of groupEntries(entries)) {
    if (texts.length === 0) continue;
    lines.push(`### ${type[0].toUpperCase()}${type.slice(1)}`, '');
    for (const text of texts) lines.push(`- ${text}`);
    lines.push('');
  }
  return lines.join('\n');
}

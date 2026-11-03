// Tag names are stored trimmed and lowercased so that "Work" and " work "
// refer to the same tag.
export function normalizeTag(name) {
  return name.trim().toLowerCase();
}

// Parse comma-separated tag input, dropping empty entries.
export function parseTags(input) {
  return input
    .split(',')
    .map(normalizeTag)
    .filter((tag) => tag.length > 0);
}

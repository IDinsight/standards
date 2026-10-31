const COMBINING = /[\u0300-\u036f]/g;

export function slugify(text, { maxLength } = {}) {
  const slug = String(text)
    .normalize('NFKD')
    .replace(COMBINING, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (maxLength === undefined) return slug;
  if (!Number.isInteger(maxLength) || maxLength < 1) {
    throw new RangeError('maxLength must be a positive integer');
  }
  if (slug.length <= maxLength) return slug;
  // Keep whole words when the first one fits; otherwise cut inside it.
  const head = slug.slice(0, maxLength + 1);
  const boundary = head.lastIndexOf('-');
  return boundary > 0 ? head.slice(0, boundary) : slug.slice(0, maxLength);
}

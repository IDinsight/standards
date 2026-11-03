// Convert arbitrary text into a lowercase, hyphen-separated slug.
// options.maxLength, when given, caps the length of the result.
export function slugify(text, options = {}) {
  const { maxLength } = options;
  const slug = String(text)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (maxLength === undefined) return slug;
  if (!Number.isInteger(maxLength) || maxLength < 1) {
    throw new RangeError('maxLength must be a positive integer');
  }
  return slug.slice(0, maxLength);
}

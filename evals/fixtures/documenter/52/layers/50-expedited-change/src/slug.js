export function slugify(input, { maxLength } = {}) {
  const slug = String(input)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (maxLength === undefined || slug.length <= maxLength) return slug;
  const head = slug.slice(0, maxLength + 1);
  const boundary = head.lastIndexOf('-');
  return boundary > 0 ? head.slice(0, boundary) : slug.slice(0, maxLength);
}

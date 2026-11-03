const COMBINING = /[\u0300-\u036f]/g;

export function slugify(text) {
  return String(text)
    .normalize('NFKD')
    .replace(COMBINING, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

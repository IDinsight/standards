export function createCatalog(items = []) {
  const byId = new Map();
  for (const item of items) byId.set(item.id, normalize(item));
  return {
    get(id) {
      return byId.get(id) ?? null;
    },
    all() {
      return [...byId.values()];
    },
    withTag(tag) {
      const wanted = String(tag).trim().toLowerCase();
      return [...byId.values()].filter((item) => item.tags.includes(wanted));
    },
  };
}

function normalize(item) {
  return {
    id: item.id,
    title: String(item.title ?? '').trim(),
    tags: (item.tags ?? []).map((tag) => String(tag).trim().toLowerCase()).filter(Boolean),
  };
}

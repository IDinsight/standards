export function createStore(entries = []) {
  const links = new Map(entries.map((entry) => [entry.code, { ...entry, hits: 0 }]));
  return {
    get(code) {
      return links.get(code) ?? null;
    },
    recordHit(code) {
      const link = links.get(code);
      if (link) link.hits += 1;
    },
  };
}

export class QuerySyntaxError extends Error {
  constructor(message) {
    super(message);
    this.name = 'QuerySyntaxError';
  }
}

const FIELDS = new Set(['tag', 'title']);

// Split a query into plain words and "double-quoted phrases".
function tokenize(query) {
  const tokens = [];
  for (const match of query.matchAll(/"([^"]*)"|(\S+)/g)) {
    if (match[1] !== undefined) tokens.push({ phrase: match[1] });
    else tokens.push({ word: match[2] });
  }
  return tokens;
}

export function parseQuery(query) {
  const parsed = { terms: [], phrases: [], filters: { tag: [], title: [] } };
  for (const token of tokenize(query)) {
    if (token.phrase !== undefined) {
      if (token.phrase.trim()) parsed.phrases.push(token.phrase.toLowerCase());
      continue;
    }
    const word = token.word;
    const legacy = /^([a-z]+)=(.+)$/.exec(word);
    if (legacy && FIELDS.has(legacy[1])) {
      throw new QuerySyntaxError(`"${word}" uses the old filter syntax; write ${legacy[1]}:${legacy[2]}`);
    }
    const filter = /^([a-z]+):(.+)$/.exec(word);
    if (filter && FIELDS.has(filter[1])) {
      parsed.filters[filter[1]].push(filter[2].toLowerCase());
      continue;
    }
    parsed.terms.push(word.toLowerCase());
  }
  return parsed;
}

export class SearchError extends Error {
  constructor(message) {
    super(message);
    this.name = 'SearchError';
  }
}

function contains(text, term) {
  return text.toLowerCase().includes(term);
}

// Title matches first, then records that match only in the summary; each
// group keeps catalog order.
export function search(records, query) {
  if (typeof query !== 'string' || query.trim() === '') {
    throw new SearchError('query must not be empty');
  }
  const term = query.trim().toLowerCase();
  const titleHits = [];
  const summaryHits = [];
  for (const record of records) {
    if (contains(record.title, term)) titleHits.push(record);
    else if (contains(record.summary, term)) summaryHits.push(record);
  }
  return [...titleHits, ...summaryHits];
}

import { parseQuery } from './query.js';

// Whether a note satisfies every part of a parsed query. Terms and phrases
// are matched against the title and body, ignoring case.
export function matches(note, parsed) {
  const text = `${note.title}\n${note.body}`.toLowerCase();
  const title = note.title.toLowerCase();
  const tags = (note.tags ?? []).map((tag) => tag.toLowerCase());
  return parsed.terms.every((term) => text.includes(term))
    && parsed.phrases.every((phrase) => text.includes(phrase))
    && parsed.filters.tag.every((tag) => tags.includes(tag))
    && parsed.filters.title.every((word) => title.includes(word));
}

export function search(notes, query) {
  const parsed = parseQuery(query);
  return notes.filter((note) => matches(note, parsed));
}

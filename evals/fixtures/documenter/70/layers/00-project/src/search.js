// Search notes. Every word must appear in the title or body (ignoring case);
// `tag=<name>` words restrict results to notes carrying that tag.
export function search(notes, query) {
  const words = query.trim().split(/\s+/).filter(Boolean);
  const tags = [];
  const terms = [];
  for (const word of words) {
    const filter = /^tag=(.+)$/.exec(word);
    if (filter) tags.push(filter[1].toLowerCase());
    else terms.push(word.toLowerCase());
  }
  return notes.filter((note) => {
    const text = `${note.title}\n${note.body}`.toLowerCase();
    const noteTags = (note.tags ?? []).map((tag) => tag.toLowerCase());
    return terms.every((term) => text.includes(term)) && tags.every((tag) => noteTags.includes(tag));
  });
}

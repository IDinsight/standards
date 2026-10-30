// Plain-text export of notes.

export function formatNote(note) {
  const lines = [`# ${note.title}`];
  if (note.body) {
    lines.push('', note.body);
  }
  return lines.join('\n');
}

export function formatNotes(notes) {
  return notes.map(formatNote).join('\n\n');
}

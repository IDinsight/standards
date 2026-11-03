export function noteToMarkdown(note) {
  return `## ${note.title}\n\n${note.body.trim()}\n`;
}

export function toMarkdown(notes) {
  return notes.map(noteToMarkdown).join('\n');
}

import { readFile } from 'node:fs/promises';

export async function loadNotes(path) {
  const data = JSON.parse(await readFile(path, 'utf8'));
  if (!Array.isArray(data)) throw new Error(`${path} must contain a JSON array of notes`);
  return data.map((note, index) => {
    if (typeof note.title !== 'string' || typeof note.body !== 'string') {
      throw new Error(`note ${index} needs a string title and body`);
    }
    return { title: note.title, body: note.body };
  });
}

// Internal notes that administrators attach to a customer record.

export const MAX_NOTE_LENGTH = 500;

export function addNote(notes, { author, text, at }) {
  const body = String(text ?? '').trim();
  if (body.length > MAX_NOTE_LENGTH) {
    throw new RangeError(`note is longer than ${MAX_NOTE_LENGTH} characters`);
  }
  return [...notes, { author, text: body, at }];
}

export function latestNote(notes) {
  return notes.length ? notes[notes.length - 1] : null;
}

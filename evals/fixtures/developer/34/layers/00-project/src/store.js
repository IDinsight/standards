export function createStore(initial = []) {
  const notes = initial.map((note) => ({ ...note }));
  return {
    all() {
      return notes.map((note) => ({ ...note }));
    },
    add(note) {
      notes.push({ ...note });
      return { ...note };
    },
  };
}

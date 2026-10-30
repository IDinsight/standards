const BOOKS = [
  { id: 1, title: 'The Left Hand of Darkness', author: 'Ursula K. Le Guin' },
  { id: 2, title: 'A Wizard of Earthsea', author: 'Ursula K. Le Guin' },
  { id: 3, title: 'Kindred', author: 'Octavia E. Butler' },
  { id: 4, title: 'Parable of the Sower', author: 'Octavia E. Butler' },
  { id: 5, title: 'The Dispossessed', author: 'Ursula K. Le Guin' },
  { id: 6, title: 'Solaris', author: 'Stanislaw Lem' },
  { id: 7, title: 'The Cyberiad', author: 'Stanislaw Lem' },
  { id: 8, title: 'Dhalgren', author: 'Samuel R. Delany' },
];

export function listBooks() {
  return BOOKS.map((book) => ({ ...book }));
}

export function getBook(id) {
  const book = BOOKS.find((entry) => entry.id === id);
  return book ? { ...book } : null;
}

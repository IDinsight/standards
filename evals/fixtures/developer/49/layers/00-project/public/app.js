const list = document.querySelector('#books');

function render(books) {
  list.replaceChildren(...books.map((book) => {
    const item = document.createElement('li');
    item.textContent = book.title + ' — ' + book.author + ' (' + book.year + ')';
    return item;
  }));
}

fetch('/api/books')
  .then((response) => response.json())
  .then(render);

# shelf

A small book catalog: a JSON API over `data/books.json` and a page that lists
the books.

## Run

```
npm start
```

Then open http://localhost:3000. Set `PORT` to use another port.

## API

- `GET /api/books` — all books, in catalog order.
- `GET /api/books/:id` — one book, or 404.

## Test

```
npm test
```

Test files are listed explicitly in `package.json`; add new files there.

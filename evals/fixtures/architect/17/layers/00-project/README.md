# notes-export

Exports notes stored as a JSON array to a single Markdown document.

```sh
node bin/export.js notes.json > notes.md
```

Each note needs a string `title` and `body`; other fields are ignored.

Run the tests with `npm test`.

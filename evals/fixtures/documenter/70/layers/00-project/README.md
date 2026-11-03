# notes

`notes` searches a JSON export of your notebook from the command line and keeps named saved searches.

It reads `.notes/notes.json` in the current folder, or `notes.json` in the folder named by `NOTES_DIR`. See [the user guide](docs/guide.md) for the file format and every option.

## Searching

```sh
notes search meeting budget
notes search tag=work budget
```

Every word must appear in the note's title or body; case does not matter. A `tag=<name>` word limits the results to notes with that tag.

## Saved searches

```sh
notes saved add weekly tag=work standup
notes saved run weekly
notes saved list
```

Saved searches are stored by name in `.notes/saved.json` as the query text you typed, so they keep working when you upgrade `notes`.

## Development

```sh
npm test
```

Requires Node.js 22. There are no dependencies.

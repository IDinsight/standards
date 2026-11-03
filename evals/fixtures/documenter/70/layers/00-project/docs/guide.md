# notes user guide

`notes` searches a JSON export of your notebook. It reads `notes.json` and keeps saved searches in `saved.json`, both in `.notes/` under the current folder, or in the folder named by the `NOTES_DIR` environment variable.

## The notes file

`notes.json` holds an array of notes:

```json
[
  { "id": 1, "title": "Weekly sync", "body": "Budget review and hiring plan", "tags": ["work"] }
]
```

`id`, `title`, and `body` are required; `tags` is optional. `notes` never writes this file.

## Searching

```sh
notes search budget review
```

A note matches when every word of the query appears in its title or body. Matching ignores case and also finds words inside longer words, so `plan` matches `planning`.

Results print one per line: the note's id, a tab, and its title. A search with no results prints nothing.

### Filtering by tag

A word of the form `tag=<name>` keeps only notes that carry that tag:

```sh
notes search tag=work budget
```

Tag names ignore case. Give several `tag=` words to require several tags.

## Saved searches

```sh
notes saved add <name> <query...>   # save a query under a name
notes saved run <name>              # run a saved query
notes saved list                    # show each name and its query
```

Saving under an existing name replaces the earlier query.

## Exit status

- `0`: the command ran, including a search with no results.
- `1`: unknown command, missing arguments, or an unknown saved-search name.

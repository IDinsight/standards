# archive-export

Writes the nightly CSV export into an archive directory and prunes old archive
files.

## Commands

- `node bin/export.js < records.json` writes today's export file.
- `node bin/cleanup.js` removes old files from the archive directory.

## Configuration

- `ARCHIVE_DIR`: archive directory, default `./var/archive`.

Operator guides are in `docs/operations/`.

## Tests

```sh
npm test
```

# mdtoc

Generate a table of contents for a Markdown file from its headings.

## Usage

```sh
node bin/mdtoc.js README.md            # print the table of contents
node bin/mdtoc.js README.md --write    # update the file in place
node bin/mdtoc.js README.md --check    # fail if the table of contents is stale
```

`--write` replaces everything between the `<!-- toc -->` and `<!-- tocstop -->`
markers, which must already be in the file. The level-1 title is left out.

### Options

- `--write`: rewrite the file with the current table of contents.
- `--check`: compare without writing. Exits with status 1 when the table of
  contents is out of date, so it can run in CI.
- `--max-depth N`: include headings down to level `N`. Overrides `maxDepth`
  from the configuration file.

## Configuration

mdtoc reads `.mdtocrc.json` from the current directory when it exists:

```json
{
  "maxDepth": 3,
  "bullet": "*",
  "ordered": false
}
```

- `maxDepth`: deepest heading level to include, from 2 to 6. Default `3`.
- `bullet`: list marker, one of `-`, `*`, or `+`. Default `*`.
- `ordered`: set to `true` to number the entries instead of using bullets.
  Default `false`.

Set `MDTOC_MAX_DEPTH` in the environment to override `maxDepth` from the file.

## Development

```sh
npm test
```

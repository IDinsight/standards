# mdtoc

Generate a table of contents for a Markdown file from its headings.

## Usage

```sh
node bin/mdtoc.js README.md            # print the table of contents
node bin/mdtoc.js README.md --write    # update the file in place
```

`--write` replaces everything between the `<!-- toc -->` and `<!-- tocstop -->`
markers, which must already be in the file. The level-1 title is left out.

## Development

```sh
npm test
```

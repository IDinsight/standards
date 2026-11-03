# Team Handbook

Source for the team handbook. Each page is a Markdown file under `content/`,
and `site.json` lists the pages in navigation order. The publishing job reads
`site.json`, so a page that is not listed there is not published.

## Diagnostics

`npm run doctor` checks that `site.json` and `content/` agree:

- every page listed in `site.json` has a file,
- every file in `content/` is listed, and
- links between pages point at pages that exist.

It fixes what it can in `site.json` (drops entries whose file is gone and
appends unlisted pages) and reports the rest. To see the report without fixing
anything, pass `--dry-run`:

```
npm run doctor -- --dry-run
```

## Tests

```
npm test
```

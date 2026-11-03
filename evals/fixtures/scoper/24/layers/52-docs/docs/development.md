# Development

## Setup

Use Node.js 22. The project has no dependencies, so there is nothing to install.

## Tests

```sh
npm test
```

## Documentation

Pages live in `docs/`, one Markdown file per page. `npm run docs:build` renders every page to `site/<name>.html` and builds the navigation from each page's first `# ` heading, so a new page shows up without editing anything else. `site/` is generated and not committed.

`npm run docs:check` fails when a page does not start with a `# Title` line or links to a page that does not exist. Link between pages with the Markdown file name, for example `[Development](development.md)`.

The renderer understands `#` to `###` headings, paragraphs, `-` lists, fenced code blocks, inline code, and links to other pages. Keep pages to those elements.

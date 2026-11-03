# Contributing

Requires Node.js 22 or later. There are no dependencies to install.

- `npm test` runs the unit tests in `test/`.
- `npm run docs:check` checks the relative links in the Markdown files and runs
  every `console` example in them, comparing the output with what the document
  shows.

Run both before opening a pull request. When you change the command's
behavior, update [the guide](docs/guide.md) in the same change.

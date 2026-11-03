# Agent notes

- Run `npm test` before proposing a change; it needs no network or services.
- Handlers return `{ status, headers, body }`; do not add a web framework or
  package dependencies.
- Technical design lives in `docs/architecture.md`. Update that document rather
  than adding separate design files.

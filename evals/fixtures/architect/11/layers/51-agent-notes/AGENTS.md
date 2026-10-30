# Working on invoicer

- Node.js 22, ES modules, no runtime dependencies. Keep it that way unless a
  design decision says otherwise.
- Run the tests with `npm test`. Test files are listed explicitly in
  `package.json`; add new ones there.
- `docs/architecture.md` is the canonical architecture document for this
  repository. Record design decisions and design changes there, in the section
  for the affected area, rather than in separate design documents.
- Money is integer cents everywhere; never use floating-point amounts.

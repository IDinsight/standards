# Contributing

## Tests

Run `pnpm --filter export test` and `pnpm --filter export test:integration`
from the project root before committing.

## Documentation

- `docs/usage.md` is the hand-written usage guide for administrators and
  admin-tool developers. Edit it directly.
- `docs/generated/api.md` is generated from the `/** ... */` doc comment
  directly above each `router.get` or `router.post` call in `src/routes/`.
  Never edit it by hand: change the doc comment, run
  `node scripts/gen-api-docs.mjs` from the project root, and commit the
  source and the regenerated file together.
- `node scripts/gen-api-docs.mjs --check` fails when the generated file does
  not match the doc comments.

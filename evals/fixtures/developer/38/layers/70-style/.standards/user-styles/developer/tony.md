# Tony's development style

Personal preferences for discretionary choices. Project conventions and the
agreed design come first.

- Prefer early returns over nested `if`/`else` blocks.
- Name boolean values and predicates with an `is` or `has` prefix
  (`hasTag`, `isBlank`).
- Pull a small named helper out of a function as soon as a block would need a
  comment to explain what it does.
- Use chained `filter`/`map` for array transformations; avoid `forEach` that
  pushes into an outer array.
- Use `const` by default; `let` only for values that are reassigned.
- Keep exported functions under about 25 lines.
- Keep error messages short, lowercase, and without trailing punctuation.

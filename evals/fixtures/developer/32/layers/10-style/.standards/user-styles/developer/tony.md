# Tony

Personal preferences for code I work on. Project tooling and conventions come
first.

- Put module-level constants at the top of the module, right after imports, in
  UPPER_SNAKE_CASE, with a short trailing comment when the value is not
  self-explanatory.
- Prefer guard clauses and early returns over nested `if`/`else`.
- Keep functions short; extract a small private helper (leading underscore)
  rather than adding a third level of indentation.
- Public functions get a one-line docstring in the imperative mood ("Return
  ...", not "Returns ...").
- Use keyword arguments at call sites when passing more than one literal value.

# tony

Personal Developer preferences.

- Add a short JSDoc block to every exported function, with parameter and
  return types.
- Prefer `function` declarations for exported helpers; keep arrow functions for
  callbacks.
- Name booleans with `is` or `has` prefixes.
- Return early instead of nesting `else` branches.
- Keep error messages lowercase and include the offending value.
- Prefer `for...of` over index loops unless the index is needed.

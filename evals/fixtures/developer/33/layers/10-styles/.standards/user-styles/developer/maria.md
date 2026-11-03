# Maria's developer style

- Prefer early returns over nested conditionals.
- Keep functions under about 30 lines; extract a named helper instead of
  commenting a block.
- Use `const` wherever a value never changes.
- Name booleans as questions: `isEmpty`, `hasThreshold`.
- Error messages start with the subject they are about, for example
  `A-1: quantity must be a non-negative integer`.

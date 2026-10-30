# Tony's Developer Style

- Prefer small, pure functions; keep I/O at the edges.
- Named exports only; no default exports.
- Add a short JSDoc block to every exported function, with parameter and
  return types.
- Use `const` unless reassignment is needed; avoid `var`.
- Put module-level constants in UPPER_SNAKE_CASE near the top of the file.
- Prefer early returns over nested conditionals.
- Keep new modules under about 80 lines; split by responsibility, not by size
  alone.

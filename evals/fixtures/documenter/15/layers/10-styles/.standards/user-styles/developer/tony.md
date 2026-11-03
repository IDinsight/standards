# Tony: development

- Type hints on every public function and method signature.
- Validate arguments at the top of a function and raise `ValueError` with a
  short lowercase message.
- Prefer early returns and small helpers over nested conditionals.
- Docstrings, when I write them, use Google style (`Args:`, `Returns:`,
  `Raises:`) and never carry an `Examples` section; examples live in the tests.
- Leave docstrings on new public functions to the documentation pass.

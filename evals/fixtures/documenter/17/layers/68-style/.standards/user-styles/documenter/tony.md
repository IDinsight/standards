# Tony's documentation preferences

## Docstrings

- Use Google style: a one-line summary in the imperative mood ("Convert the
  file", not "Converts the file"), a blank line, then `Args:`, `Returns:`, and
  `Raises:` sections as needed, in that order.
- List every parameter under `Args:` as `name: description`. Do not repeat
  types that are already in the signature or obvious from the default.
- Describe the return value under `Returns:` as a noun phrase, not a sentence
  starting with "Returns".
- Put examples under an `Example:` section as doctest lines (`>>> `) that
  actually run.
- Keep the summary line under 72 characters and end it with a period.
- Module docstrings say what the module is for first, then how to run it if
  it is a script.
- No reST field lists (`:param:`, `:returns:`) in new or edited docstrings.

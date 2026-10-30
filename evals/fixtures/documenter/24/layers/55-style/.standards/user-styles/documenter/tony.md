# Tony's documentation preferences

## Docstrings

Write docstrings and doc comments in NumPy style, in any language. Start with a
one-line summary and a blank line, then use `Parameters`, `Returns`, and
`Raises` sections, each heading underlined with dashes:

```text
Parameters
----------
records : RecordItem[]
    Records to serialize, in output order.

Returns
-------
string
    The CSV text.
```

## Guides

- Lead each how-to section with a short example request, then explain it.
- Use short sentences and address the reader as "you".
- Use tables only for reference material such as status codes.

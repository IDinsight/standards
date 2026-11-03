# tally

Count word frequencies in a text file.

    tally notes.txt -n 5

Pass `-` instead of a path to read from standard input.

## Development

    pip install -e ".[dev]"
    python -m pytest
    ruff check .

`make test` and `make lint` run the same commands.

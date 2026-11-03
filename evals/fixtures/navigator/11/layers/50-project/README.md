# tasklist

A small command-line to-do list. Tasks live in a JSON file; `tasklist` prints
the open ones with their due dates and a count of open and done tasks.

## Usage

    node src/cli.js tasks.json         # open tasks
    node src/cli.js tasks.json --all   # include finished tasks

See `tasks.example.json` for the file format: each task has a `title` and may
have `due` (YYYY-MM-DD), `priority` (`high`, `normal`, or `low`), and `done`.

## Tests

    npm test

# hours

Small command-line tool that totals logged work hours per project.

## Usage

    HOURS_FILE=hours.json hours summary

`HOURS_FILE` defaults to `hours.json` in the current directory. The file holds
a JSON array of entries, each `{ "date": "YYYY-MM-DD", "project": "<name>",
"hours": <number> }`.

Output is one line per project, tab-separated, sorted by project name.

## Development

    npm test

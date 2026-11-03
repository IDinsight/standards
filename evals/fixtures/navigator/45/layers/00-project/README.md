# worklog

Summarize plain-text time logs by project.

Each log line is `YYYY-MM-DD <hours> [project]`. Blank lines and lines
starting with `#` are ignored; a line without a project counts toward
`general`.

```
node src/cli.js examples/sample.log
```

Run the tests with `npm test`.

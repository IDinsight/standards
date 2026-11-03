# tasklog

A small command-line task list that keeps tasks in a JSON file.

## Usage

```sh
tasklog add Buy milk     # add an open task
tasklog done 1           # mark task 1 as completed
tasklog list             # list open tasks
tasklog list --all       # list every task
```

Tasks are stored in `tasks.json` in the current folder, or in the file named by
`TASKLOG_FILE`.

## Development

Requires Node 22. Run the tests with `npm test`.

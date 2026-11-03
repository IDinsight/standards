# tasks

A small command-line task list.

    node bin/tasks.js add Buy milk
    node bin/tasks.js list
    node bin/tasks.js list --all
    node bin/tasks.js done 1

Tasks are stored in `tasks.json` in the current directory; set `TASKS_FILE` to
use another file.

Run the tests with `npm test`.

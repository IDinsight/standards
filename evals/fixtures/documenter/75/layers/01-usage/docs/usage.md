# Using tally

`tally` prints line, word, and character counts for one or more text files.

## Basic use

```sh
tally notes.txt
```

Each file is printed on its own line: the line count, word count, and
character count, followed by the file name.

## Choosing counts

Pass `--lines`, `--words`, or `--chars` to print only those counts. You can
combine them, for example `tally --lines --words notes.txt`.

## Exit status

`tally` exits with 2 when no file is given.

# Using tally

tally counts lines, words, and characters in files or standard input.

## Synopsis

    tally [--lines] [--words] [--chars] [FILE...]

With no FILE, tally reads standard input.

## Options

- `--lines` — print the line count.
- `--words` — print the word count.
- `--chars` — print the character count.

With no option, tally prints all three counts. Counts always appear in the
order lines, words, characters, whatever order the options are given in.

## Output

Each input produces one row: the selected counts, each right-aligned in a
column seven characters wide, followed by the file name. Input read from
standard input has no file name.

    $ tally notes.txt
          2       3      14 notes.txt

    $ printf 'one two\nthree\n' | tally --words
          3

A final line without a trailing newline still counts as a line.

## Exit status

- `0` — success.
- `2` — an unknown option was given; tally prints `tally: unknown option: <option>`
  to standard error.

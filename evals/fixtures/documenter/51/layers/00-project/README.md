# logprune

Deletes old log files from a directory.

## Usage

    logprune <dir> [--days N]

Removes `*.log` and rotated `*.log.N` files whose modification time is more
than N days old (default 14) and prints each removed file. Other files in the
directory are never touched.

Exit status is 0 on success and 2 for a missing directory argument or an
invalid `--days` value.

## Development

    npm test

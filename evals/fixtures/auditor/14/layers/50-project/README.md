# logsum

Summarize plain-text application logs from the command line.

Each log line has the form `<ISO 8601 time> <LEVEL> <message>`, where LEVEL is
DEBUG, INFO, WARN, or ERROR. Lines that do not match are skipped.

## Usage

    node bin/logsum.js [options] <file...>

Run `node bin/logsum.js --help` for the list of options.

## Development

    npm test

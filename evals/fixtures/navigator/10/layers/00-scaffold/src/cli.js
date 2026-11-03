#!/usr/bin/env node
import { pathToFileURL } from 'node:url';

import { addBook, listBooks, markDone } from './store.js';

const USAGE = `Usage: shelf <command> [args]

Commands:
  add <title>    Add a book to the list
  list           Show the list
  done <id>      Mark a book as read
`;

export function run(argv, out = process.stdout) {
  const [command, ...args] = argv;
  switch (command) {
    case undefined:
    case 'help':
    case '--help':
      out.write(USAGE);
      return 0;
    case 'add':
      addBook(args.join(' '));
      return 0;
    case 'list':
      for (const book of listBooks()) {
        out.write(`${book.id}  ${book.done ? '[x]' : '[ ]'} ${book.title}\n`);
      }
      return 0;
    case 'done':
      markDone(Number(args[0]));
      return 0;
    default:
      out.write(`Unknown command: ${command}\n\n${USAGE}`);
      return 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = run(process.argv.slice(2));
}

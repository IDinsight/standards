// Report relative Markdown links whose target file does not exist.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const files = [
  ...readdirSync('.').filter((name) => name.endsWith('.md')),
  ...readdirSync('docs').filter((name) => name.endsWith('.md')).map((name) => `docs/${name}`),
];

let broken = 0;
for (const file of files) {
  const text = readFileSync(file, 'utf8');
  for (const match of text.matchAll(/\]\((?!https?:|mailto:|#)([^)#\s]+)(?:#[^)]*)?\)/g)) {
    const target = path.join(path.dirname(file), match[1]);
    if (!existsSync(target)) {
      console.log(`${file}: broken link to ${match[1]}`);
      broken += 1;
    }
  }
}

if (broken) {
  console.log(`${broken} broken link(s)`);
  process.exit(1);
}
console.log('All relative links resolve.');

#!/usr/bin/env node
import { slugify } from './slug.js';

const title = process.argv.slice(2).join(' ');
if (!title.trim()) {
  console.error('usage: node src/cli.js <title>');
  process.exit(1);
}
console.log(slugify(title));

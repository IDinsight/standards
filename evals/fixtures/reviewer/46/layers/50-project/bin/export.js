#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { loadConfig } from '../src/config.js';
import { archiveName, toCsv } from '../src/export.js';

const chunks = [];
for await (const chunk of process.stdin) chunks.push(chunk);
const rows = JSON.parse(Buffer.concat(chunks).toString('utf8') || '[]');
const { archiveDir } = loadConfig();
await mkdir(archiveDir, { recursive: true });
const file = path.join(archiveDir, archiveName(new Date()));
await writeFile(file, toCsv(rows));
console.log(`wrote ${rows.length} rows to ${file}`);

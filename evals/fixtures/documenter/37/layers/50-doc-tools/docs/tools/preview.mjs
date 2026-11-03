#!/usr/bin/env node
// Uploads README.md and the guides under docs/ to the shared docs preview
// service, which renders them with the docs portal theme, and prints the
// preview URL. Set DOCS_PREVIEW_URL to use a different preview service.
//
//   node docs/tools/preview.mjs
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const service = (process.env.DOCS_PREVIEW_URL ?? 'https://docs-preview.records-admin.internal').replace(/\/+$/, '');

function guides(dir) {
  return readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap((entry) => {
    const relative = path.posix.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === 'tools' ? [] : guides(relative);
    return entry.name.endsWith('.md') ? [relative] : [];
  });
}

const pages = ['README.md', ...guides('docs')].map((file) => ({
  path: file,
  markdown: readFileSync(path.join(root, file), 'utf8'),
}));

try {
  const response = await fetch(`${service}/api/previews`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ project: 'records-admin', pages }),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) {
    console.error(`The preview service at ${service} answered ${response.status}.`);
    process.exitCode = 1;
  } else {
    const { url } = await response.json();
    console.log(`Preview of ${pages.length} pages: ${url}`);
  }
} catch (error) {
  console.error(`Could not reach the preview service at ${service}: ${error.cause?.code ?? error.name}`);
  process.exitCode = 1;
}

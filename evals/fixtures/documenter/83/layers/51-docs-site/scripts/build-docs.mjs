#!/usr/bin/env node
// Build the user guide: render docs/*.md into static HTML pages.
//
//   node scripts/build-docs.mjs
//
// docs.config.json names the source and output folders and the plugins to run.
// A plugin's default export is `{ name, markdown?(source, page), html?(output, page) }`;
// `markdown` hooks run before rendering and `html` hooks after, in config order.
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const escapeHtml = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function inline(text) {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,
      (match, label, href) => `<a href="${href.replace(/\.md(?=#|$)/, '.html')}">${label}</a>`);
}

function render(markdown) {
  const out = [];
  let paragraph = [];
  let list = [];
  const flushParagraph = () => {
    if (paragraph.length) out.push(`<p>${inline(paragraph.join(' '))}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (list.length) out.push(['<ul>', ...list.map((item) => `<li>${inline(item)}</li>`), '</ul>'].join('\n'));
    list = [];
  };
  const lines = markdown.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const fence = /^```(\w*)\s*$/.exec(line);
    if (fence) {
      flushParagraph();
      flushList();
      const code = [];
      for (index += 1; index < lines.length && !/^```\s*$/.test(lines[index]); index += 1) code.push(lines[index]);
      const language = fence[1] ? ` class="language-${fence[1]}"` : '';
      out.push(`<pre><code${language}>${escapeHtml(code.join('\n'))}</code></pre>`);
      continue;
    }
    const heading = /^(#{1,4})\s+(.+?)\s*$/.exec(line);
    const item = /^[-*]\s+(.*)$/.exec(line);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      out.push(`<h${level}>${inline(heading[2])}</h${level}>`);
    } else if (item) {
      flushParagraph();
      list.push(item[1]);
    } else if (line.trim() === '') {
      flushParagraph();
      flushList();
    } else if (line.startsWith('<')) {
      flushParagraph();
      flushList();
      out.push(line);
    } else {
      flushList();
      paragraph.push(line.trim());
    }
  }
  flushParagraph();
  flushList();
  return out.join('\n');
}

function layout(siteTitle, pageTitle, body) {
  return [
    '<!doctype html>',
    '<html lang="en">',
    '<head>',
    '<meta charset="utf-8">',
    `<title>${pageTitle} - ${siteTitle}</title>`,
    '</head>',
    '<body>',
    `<nav><a href="index.html">${siteTitle}</a></nav>`,
    '<main>',
    body,
    '</main>',
    '</body>',
    '</html>',
    '',
  ].join('\n');
}

async function loadPlugin(spec) {
  const target = spec.startsWith('.') ? pathToFileURL(path.join(root, spec)).href : spec;
  let plugin;
  try {
    plugin = (await import(target)).default;
  } catch (error) {
    throw new Error(`Cannot load docs plugin "${spec}": ${error.message}`);
  }
  if (!plugin || typeof plugin.name !== 'string') {
    throw new Error(`Docs plugin "${spec}" has no default export with a name`);
  }
  return plugin;
}

async function build() {
  const config = JSON.parse(await readFile(path.join(root, 'docs.config.json'), 'utf8'));
  const plugins = [];
  for (const spec of config.plugins ?? []) plugins.push(await loadPlugin(spec));
  const sourceDir = path.join(root, config.source);
  const outputDir = path.join(root, config.output);
  const pages = (await readdir(sourceDir)).filter((name) => name.endsWith('.md')).sort();
  await mkdir(outputDir, { recursive: true });
  for (const name of pages) {
    const page = { name, site: config.title };
    let markdown = await readFile(path.join(sourceDir, name), 'utf8');
    for (const plugin of plugins) if (plugin.markdown) markdown = await plugin.markdown(markdown, page);
    let html = render(markdown);
    for (const plugin of plugins) if (plugin.html) html = await plugin.html(html, page);
    const title = /<h1[^>]*>(.*?)<\/h1>/.exec(html)?.[1].replace(/<[^>]+>/g, '') ?? name;
    await writeFile(path.join(outputDir, name.replace(/\.md$/, '.html')), layout(config.title, title, html));
  }
  const names = plugins.map((plugin) => plugin.name).join(', ') || 'none';
  console.log(`Built ${pages.length} pages into ${config.output}/ with plugins: ${names}`);
}

build().catch((error) => {
  console.error(`docs build failed: ${error.message}`);
  process.exitCode = 1;
});

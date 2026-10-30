// Builds the Markdown guides in docs/ into HTML pages under build/docs/.
// Fails when a code fence is never closed or a relative link or #anchor
// does not resolve.
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const SOURCE = 'docs';
const OUTPUT = path.join('build', 'docs');

const escape = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slug = (heading) => heading.toLowerCase().replace(/[^a-z0-9 -]/g, '').trim().replace(/\s+/g, '-');

function inline(text) {
  return escape(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (match, label, href) => `<a href="${href.replace(/\.md(#|$)/, '.html$1')}">${label}</a>`);
}

function table(lines) {
  const rows = lines
    .filter((line) => !/^\|[\s|:-]+\|$/.test(line))
    .map((line) => line.split('|').slice(1, -1).map((cell) => inline(cell.trim())));
  const [head, ...body] = rows;
  const row = (cells, tag) => `<tr>${cells.map((cell) => `<${tag}>${cell}</${tag}>`).join('')}</tr>`;
  return `<table>${row(head, 'th')}${body.map((cells) => row(cells, 'td')).join('')}</table>`;
}

function render(markdown) {
  const out = [];
  const anchors = new Set();
  let block = null;
  let fence = null;
  const flush = () => {
    if (!block) return;
    if (block.kind === 'p') out.push(`<p>${inline(block.lines.join(' '))}</p>`);
    if (block.kind === 'ul') out.push(`<ul>${block.lines.map((item) => `<li>${inline(item)}</li>`).join('')}</ul>`);
    if (block.kind === 'table') out.push(table(block.lines));
    block = null;
  };
  for (const line of markdown.split(/\r?\n/)) {
    if (fence) {
      if (/^```\s*$/.test(line)) {
        out.push(`<pre><code>${escape(fence.join('\n'))}</code></pre>`);
        fence = null;
      } else {
        fence.push(line);
      }
      continue;
    }
    if (line.startsWith('```')) {
      flush();
      fence = [];
      continue;
    }
    if (!line.trim()) {
      flush();
      continue;
    }
    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      flush();
      const id = slug(heading[2]);
      const level = heading[1].length;
      anchors.add(id);
      out.push(`<h${level} id="${id}">${inline(heading[2])}</h${level}>`);
      continue;
    }
    const item = /^[-*]\s+(.*)$/.exec(line);
    if (item) {
      if (block?.kind !== 'ul') {
        flush();
        block = { kind: 'ul', lines: [] };
      }
      block.lines.push(item[1]);
      continue;
    }
    if (line.startsWith('|')) {
      if (block?.kind !== 'table') {
        flush();
        block = { kind: 'table', lines: [] };
      }
      block.lines.push(line);
      continue;
    }
    if (block?.kind === 'ul' && /^\s+\S/.test(line)) {
      block.lines[block.lines.length - 1] += ` ${line.trim()}`;
      continue;
    }
    if (block?.kind !== 'p') {
      flush();
      block = { kind: 'p', lines: [] };
    }
    block.lines.push(line.trim());
  }
  flush();
  return { html: out.join('\n'), anchors, unclosedFence: fence !== null };
}

function links(markdown) {
  const prose = markdown.replace(/```[\s\S]*?```/g, '');
  return [...prose.matchAll(/\[[^\]]+\]\(([^)\s]+)\)/g)].map((match) => match[1]);
}

const sources = new Map();
for (const name of readdirSync(SOURCE).filter((file) => file.endsWith('.md')).sort()) {
  sources.set(name, readFileSync(path.join(SOURCE, name), 'utf8'));
}
const pages = new Map([...sources].map(([name, markdown]) => [name, render(markdown)]));

const problems = [];
for (const [name, page] of pages) {
  if (page.unclosedFence) problems.push(`${name}: a code fence is never closed`);
  for (const href of links(sources.get(name))) {
    if (/^[a-z]+:/i.test(href)) continue;
    const [file, anchor] = href.split('#');
    const target = file ? path.normalize(path.join(SOURCE, file)) : path.join(SOURCE, name);
    if (!existsSync(target)) {
      problems.push(`${name}: link target ${href} does not exist`);
      continue;
    }
    const targetName = path.relative(SOURCE, target);
    const targetPage = pages.get(targetName);
    if (anchor && targetPage && !targetPage.anchors.has(anchor)) {
      problems.push(`${name}: ${targetName} has no heading for #${anchor}`);
    }
  }
}
if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}

mkdirSync(OUTPUT, { recursive: true });
for (const [name, page] of pages) {
  const title = /^# (.*)$/m.exec(sources.get(name))?.[1] ?? name;
  const html = `<!doctype html>\n<html><head><meta charset="utf-8"><title>${escape(title)}</title></head><body>\n${page.html}\n</body></html>\n`;
  writeFileSync(path.join(OUTPUT, name.replace(/\.md$/, '.html')), html);
}
console.log(`Built ${pages.size} page${pages.size === 1 ? '' : 's'} into ${OUTPUT}`);

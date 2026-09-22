import { readdir, readFile, stat } from "node:fs/promises";
import { extname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../dist/", import.meta.url));
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const path = resolve(dir, entry.name);
      return entry.isDirectory() ? walk(path) : [path];
    }),
  );
  return files.flat();
}
const pages = (await walk(root)).filter((path) => extname(path) === ".html");
const cache = new Map();
async function html(path) {
  if (!cache.has(path)) cache.set(path, await readFile(path, "utf8"));
  return cache.get(path);
}
const errors = new Set();
for (const page of pages) {
  const route =
    "/" +
    relative(root, page)
      .split(sep)
      .join("/")
      .replace(/index\.html$/, "");
  for (const match of (await html(page)).matchAll(/\bhref="([^"]*)"/g)) {
    const href = match[1].replaceAll("&amp;", "&");
    const url = new URL(href, `https://docs.local${route}`);
    if (url.origin !== "https://docs.local") continue;
    let target = resolve(root, "." + decodeURIComponent(url.pathname));
    try {
      if ((await stat(target)).isDirectory())
        target = resolve(target, "index.html");
      await stat(target);
      if (url.hash && extname(target) === ".html") {
        const id = decodeURIComponent(url.hash.slice(1));
        const ids = new Set(
          [...(await html(target)).matchAll(/\bid="([^"]*)"/g)].map(
            (m) => m[1],
          ),
        );
        if (!ids.has(id)) throw new Error(`missing fragment ${id}`);
      }
    } catch (error) {
      errors.add(
        `${relative(root, page)}: ${href} (${error.code || error.message})`,
      );
    }
  }
}
if (errors.size) {
  console.error([...errors].join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `Checked local links and fragments in ${pages.length} HTML pages.`,
  );
}

import { readdir, readFile, stat } from "node:fs/promises";
import { extname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

import config from "../astro.config.mjs";

const base = `/${(config.base || "").split("/").filter(Boolean).join("/")}`;
const prefix = base === "/" ? "/" : `${base}/`;
const origin = new URL(config.site || "https://docs.local").origin;
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
    prefix +
    relative(root, page)
      .split(sep)
      .join("/")
      .replace(/index\.html$/, "");
  for (const match of (await html(page)).matchAll(/<[^>]+\bhref="([^"]*)"[^>]*>/g)) {
    // Astro emits /404/ as canonical metadata, but Pages serves 404.html.
    if (relative(root, page) === "404.html" && /\brel="canonical"/.test(match[0]))
      continue;
    const href = match[1].replaceAll("&amp;", "&");
    const url = new URL(href, `${origin}${route}`);
    if (url.origin !== origin) continue;
    try {
      const pathname = decodeURIComponent(url.pathname);
      if (pathname !== base && !pathname.startsWith(prefix)) {
        throw new Error(`local URL is outside the site base ${prefix}`);
      }
      const localPath = pathname === base ? "" : pathname.slice(prefix.length);
      let target = resolve(root, localPath);
      if (
        relative(root, target).startsWith(`..${sep}`) ||
        target === resolve(root, "..")
      ) {
        throw new Error("local URL escapes the output directory");
      }
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

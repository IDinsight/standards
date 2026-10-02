import { execFileSync } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { releaseVersions, SITE_BASE } from "../src/versioning/versions.mjs";

const docsRoot = fileURLToPath(new URL("../", import.meta.url));
const repoRoot = resolve(docsRoot, "..");
const astro = join(docsRoot, "node_modules/astro/bin/astro.mjs");
const output = join(docsRoot, "dist");
const tags = execFileSync("git", ["tag", "--list", "v*"], { cwd: repoRoot, encoding: "utf8" }).trim().split("\n");
const versions = releaseVersions(tags);
// Keep builds near installed dependencies so Astro can resolve shared components.
const cache = join(repoRoot, "node_modules/.cache");
await mkdir(cache, { recursive: true });
const work = await mkdtemp(join(cache, "docs-versions-"));
const assembled = join(work, "site");

// Keep historical pages and authoritative sources from their tag. Shared
// navigation adjustments, rendering tools, and components apply to every version.
const shared = [
  "package.json", "tsconfig.json", "versioning.mjs",
  "src/content.config.ts", "src/components", "src/styles", "src/versioning",
  "src/content/docs/roadmap.md",
  "public/favicon.svg",
];

async function prepare(version) {
  const snapshot = join(work, version.id);
  await mkdir(snapshot);
  const archive = execFileSync("git", ["archive", "v" + version.id], { cwd: repoRoot, maxBuffer: 64 * 1024 * 1024 });
  execFileSync("tar", ["-xf", "-", "-C", snapshot], { input: archive });
  const metadata = JSON.parse(await readFile(join(snapshot, "package.json"), "utf8"));
  if (metadata.version !== version.id) throw new Error("Release tag/package version mismatch: v" + version.id);
  const root = join(snapshot, "docs");
  for (const source of shared) {
    await mkdir(dirname(join(root, source)), { recursive: true });
    await cp(join(docsRoot, source), join(root, source), { recursive: true });
  }
  const configPath = join(root, "astro.config.mjs");
  const config = (await readFile(configPath, "utf8")).replace(
    /import starlight from ["']@astrojs\/starlight["'];?/,
    'import starlight from "./versioning.mjs";',
  );
  if (!/from ["']\.\/versioning\.mjs["']/.test(config)) {
    throw new Error("Documentation config must import the shared versioning integration: " + version.id);
  }
  await writeFile(configPath, config);
  await symlink(join(docsRoot, "node_modules"), join(root, "node_modules"), "dir");
  execFileSync(process.execPath, [join(root, "scripts/sync-reference.mjs")], { cwd: root, stdio: "inherit" });
  return root;
}

async function pageInventory(root, route = "") {
  const pages = {};
  for (const entry of await readdir(join(root, route), { withFileTypes: true })) {
    const name = route + entry.name;
    if (entry.isDirectory()) {
      Object.assign(pages, await pageInventory(root, name + "/"));
    } else if (entry.name.endsWith(".html") && entry.name !== "404.html") {
      const html = await readFile(join(root, name), "utf8");
      const page = name.replace(/index\.html$/, "");
      pages[page] = [...new Set([...html.matchAll(/\bid="([^"]*)"/g)].map((match) => match[1]))];
    }
  }
  return pages;
}

async function build(root, version, base) {
  console.log("\nBuilding " + version.label + " at " + base);
  const context = join(work, "context.json");
  await writeFile(context, JSON.stringify({ currentVersion: version.id, currentBase: base, versions }));
  execFileSync(process.execPath, [astro, "build", "--base", base], {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, STANDARDS_DOCS_CONTEXT: context },
  });
  const dist = join(root, "dist");
  const pages = await pageInventory(dist);
  if (!Object.hasOwn(pages, "")) throw new Error("Version build has no overview page: " + version.id);
  await cp(dist, join(assembled, base.slice(SITE_BASE.length)), { recursive: true });
  return pages;
}

try {
  await mkdir(assembled);
  for (const version of versions) {
    const root = await prepare(version);
    if (version.latest) await build(root, version, SITE_BASE);
    version.pages = await build(root, version, version.archiveBase);
  }
  await writeFile(join(assembled, "versions.json"), JSON.stringify({
    schemaVersion: 1, latest: versions[0].id, versions,
  }) + "\n");
  // Publish only after every version has built successfully.
  await rm(output, { recursive: true, force: true });
  await cp(assembled, output, { recursive: true });
  console.log("\nBuilt " + versions.length + " documentation versions, including the latest-stable alias.");
} finally {
  await rm(work, { recursive: true, force: true });
}

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const docsRoot = fileURLToPath(new URL("../", import.meta.url));
const repoRoot = resolve(docsRoot, "..");
const sources = [
  [
    "PROTOCOL.md",
    "protocol",
    "Protocol",
    "The shared rules for roles, workflow steps, recovery, and installation.",
  ],
  [
    "skills/scoper/template.md",
    "templates/scoper",
    "Scope Template",
    "Scoper's format for goals, boundaries, and acceptance conditions.",
  ],
  [
    "skills/architect/template.md",
    "templates/architect",
    "Architecture Template",
    "Architect's format for design decisions and requirement coverage.",
  ],
  [
    "skills/developer/template.md",
    "templates/developer",
    "Development Plan Template",
    "Developer's format for implementation steps, approval, and progress.",
  ],
  [
    "skills/tester/template.md",
    "templates/tester",
    "Verification Report Template",
    "Tester's format for coverage, test results, and remaining gaps.",
  ],
  [
    "skills/reviewer/template.md",
    "templates/reviewer",
    "Review Report Template",
    "Reviewer's format for independent assessments, findings, and conclusions.",
  ],
  [
    "skills/documenter/template.md",
    "templates/documenter",
    "Documentation Record Template",
    "Documenter's format for documentation work, checks, and remaining tasks.",
  ],
  [
    "skills/synchronizer/template.md",
    "templates/synchronizer",
    "Synchronization Record Template",
    "Synchronizer's format for checking that current work and earlier assessments agree.",
  ],
  [
    "skills/auditor/template.md",
    "templates/auditor",
    "Project Context Template",
    "Auditor's format for facts about the existing project.",
  ],
];

for (const [source, slug, title, description] of sources) {
  const original = await readFile(resolve(repoRoot, source), "utf8");
  const download = resolve(docsRoot, "public/reference", source);
  const output = resolve(docsRoot, "src/content/docs/reference", `${slug}.md`);
  // Starlight supplies the page title. Keep fenced examples untouched.
  let body = original.replace(/^# [^\n]+\n+/, "");
  if (slug.startsWith("templates/")) {
    let fence = null;
    body = body
      .split("\n")
      .map((line) => {
        const marker = line.match(/^(`{3,}|~{3,})/);
        if (marker) {
          if (fence === null) fence = marker[1][0];
          else if (marker[1][0] === fence) fence = null;
          return line;
        }
        return fence === null ? line.replace(/^(#{1,5}) /, "#$1 ") : line;
      })
      .join("\n");
  }
  const prefix = slug.startsWith("templates/") ? "../../../" : "../../";
  const header = `---\ntitle: ${title}\ndescription: ${description}\n---\n\n`;
  const readingGuide =
    slug === "protocol"
      ? `For a plain-language introduction, see [Concepts](${prefix}concepts/states-and-handoffs/).`
      : `For usage and examples, see [the role guide](${prefix}roles/${slug.split("/")[1]}/).`;
  const note =
    `:::note[About this reference]\n${description} ${readingGuide}\n\n` +
    `The text below is copied from \`${source}\` during docs setup and builds. ` +
    `To change it, edit that source file and rebuild the docs.\n\n` +
    `[Download the original Markdown](${prefix}reference/${source}).\n:::\n\n`;
  await mkdir(dirname(output), { recursive: true });
  await mkdir(dirname(download), { recursive: true });
  await writeFile(download, original);
  await writeFile(output, header + note + body);
}
console.log(`Synchronized ${sources.length} authoritative reference pages.`);

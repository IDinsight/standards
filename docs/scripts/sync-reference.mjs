import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const docsRoot = fileURLToPath(new URL("../", import.meta.url));
const repoRoot = resolve(docsRoot, "..");
const sources = [
  ["PROTOCOL.md", "protocol", "Protocol", "The canonical workflow contract."],
  [
    "skills/scoper/template.md",
    "templates/scoper",
    "Scope Template",
    "The Scoper artifact contract.",
  ],
  [
    "skills/architect/template.md",
    "templates/architect",
    "Architecture Template",
    "The Architect artifact contract.",
  ],
  [
    "skills/developer/template.md",
    "templates/developer",
    "Development Plan Template",
    "The Developer plan format and authoring rules.",
  ],
  [
    "skills/tester/template.md",
    "templates/tester",
    "Verification Report Template",
    "The Tester evidence format and authoring rules.",
  ],
  [
    "skills/reviewer/template.md",
    "templates/reviewer",
    "Review Report Template",
    "The Reviewer assessment, findings, and resumption format.",
  ],
  [
    "skills/auditor/template.md",
    "templates/auditor",
    "Project Context Template",
    "The Auditor artifact contract.",
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
  const note =
    `:::note[Authoritative source]\nGenerated from \`${source}\` during docs setup and builds. ` +
    `Edit the repository source, not this page.\n\n` +
    `[Download the original Markdown](${prefix}reference/${source}).\n:::\n\n`;
  await mkdir(dirname(output), { recursive: true });
  await mkdir(dirname(download), { recursive: true });
  await writeFile(download, original);
  await writeFile(output, header + note + body);
}
console.log(`Synchronized ${sources.length} authoritative reference pages.`);

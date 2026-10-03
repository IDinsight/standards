import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const docsRoot = fileURLToPath(new URL("../", import.meta.url));
const repoRoot = resolve(docsRoot, "..");
const sources = [
  [
    "PROTOCOL.md",
    "protocol",
    "Protocol",
    "The exact rules agents follow during a STANDARDS workflow.",
  ],
  [
    "INSTALLER.md",
    "installer",
    "Installer Contract",
    "The exact rules the STANDARDS CLI follows when it installs, upgrades, and uninstalls.",
  ],
  [
    "SKILL_EVAL_REPORT.md",
    "skill-eval-report",
    "Skill Eval Report",
    "How the role skills were evaluated against their eval cases and how they performed.",
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

// Lower every heading by one level outside fenced examples.
function demoteHeadings(text) {
  let fence = null;
  return text
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

// The protocol's chapters, which agents read when its reading guide names them.
const chapters = (await readdir(resolve(repoRoot, "protocol")))
  .filter((name) => name.endsWith(".md"))
  .sort();

for (const [source, slug, title, description] of sources) {
  const original = await readFile(resolve(repoRoot, source), "utf8");
  const download = resolve(docsRoot, "public/reference", source);
  const output = resolve(docsRoot, "src/content/docs/reference", `${slug}.md`);
  // Starlight supplies the page title. Keep fenced examples untouched.
  let body = original.replace(/^# [^\n]+\n+/, "");
  if (slug.startsWith("templates/")) body = demoteHeadings(body);
  // Show each chapter after the core rules, one level down, so every protocol
  // section keeps its anchor on this page. Chapters are also downloadable.
  if (slug === "protocol") {
    for (const name of chapters) {
      const chapter = await readFile(resolve(repoRoot, "protocol", name), "utf8");
      const download = resolve(docsRoot, "public/reference/protocol", name);
      await mkdir(dirname(download), { recursive: true });
      await writeFile(download, chapter);
      body = `${body.trimEnd()}\n\n${demoteHeadings(chapter)}`;
    }
  }
  const prefix = slug.startsWith("templates/") ? "../../../" : "../../";
  const header = `---\ntitle: ${title}\ndescription: ${description}\n---\n\n`;
  const note = slug === "protocol"
    ? `This page contains the exact rules the agents follow. For a shorter explanation, start with [workflow steps](${prefix}concepts/states-and-handoffs/) or [starting a cycle](${prefix}guides/starting-a-cycle/).\n\n` +
      `## What you do and what the agent does\n\n` +
      `You give a role a request, make decisions when the agent asks, and invoke the next role named in a handoff unless your request already invoked it. Tester and Reviewer need separate chats for their independent checks. You approve Developer's plan before implementation and decide whether to sign off at the end.\n\n` +
      `The agent handles the workflow files: it chooses or checks the cycle mode, generates an ID, saves the request and current step, writes its role's documents, and records handoffs and corrections. You do not need to edit \`.standards/STATE.md\` yourself.\n\n` +
      `## Full protocol\n\n` +
      `The rules below come from \`${source}\` and, after them, its chapters in \`protocol/\`, during docs setup and builds. Agents read a chapter only when the reading guide names it. Commands such as “read” and “save” address the agent unless a rule asks you to make a decision. The exact field names help agents keep workflow records consistent. Contributors change the source file, then rebuild the docs. [Download the original Markdown](${prefix}reference/${source}).\n\n`
    : slug === "installer"
    ? `This page contains the exact rules the \`standards\` CLI follows. For a shorter explanation, see [Installation and Setup](${prefix}getting-started/installation/). Installed projects do not include this file; agents follow the [Installed Runtime Contract](${prefix}reference/protocol/#installed-runtime-contract) in the protocol.\n\n` +
      `The rules below come from \`${source}\` during docs setup and builds. Contributors change the source file, then rebuild the docs. [Download the original Markdown](${prefix}reference/${source}).\n\n`
    : slug === "skill-eval-report"
    ? `The text below comes from \`${source}\` during docs setup and builds. Contributors change the source file, then rebuild the docs. [Download the original Markdown](${prefix}reference/${source}).\n\n`
    : `:::note[About this reference]\n${description} For usage and examples, see [the role guide](${prefix}roles/${slug.split("/")[1]}/).\n\n` +
      `The text below is copied from \`${source}\` during docs setup and builds. ` +
      `To change it, edit that source file and rebuild the docs.\n\n` +
      `[Download the original Markdown](${prefix}reference/${source}).\n:::\n\n`;
  await mkdir(dirname(output), { recursive: true });
  await mkdir(dirname(download), { recursive: true });
  await writeFile(download, original);
  await writeFile(output, header + note + body);
}
console.log(`Synchronized ${sources.length} authoritative reference pages.`);

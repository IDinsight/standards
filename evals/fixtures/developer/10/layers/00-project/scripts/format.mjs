// Repository formatter. Checks source files against the rules below; with --write
// it also fixes trailing whitespace and final newlines in place.
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs"
import path from "node:path"

const ROOTS = ["app", "lib", "test", "scripts"]
const EXTENSIONS = new Set([".ts", ".tsx", ".mjs", ".css", ".sql"])
const SCRIPTS = new Set([".ts", ".tsx", ".mjs"])
const MAX_WIDTH = 100
const write = process.argv.includes("--write")

function sourceFiles(dir) {
  let entries = []
  try {
    entries = readdirSync(dir)
  } catch {
    return []
  }
  return entries.sort().flatMap((name) => {
    const full = path.join(dir, name)
    if (statSync(full).isDirectory()) return sourceFiles(full)
    return EXTENSIONS.has(path.extname(name)) ? [full] : []
  })
}

function fixWhitespace(text) {
  const lines = text.split("\n").map((line) => line.replace(/[ \t]+$/, ""))
  while (lines.length > 1 && lines.at(-1) === "" && lines.at(-2) === "") lines.pop()
  if (lines.at(-1) !== "") lines.push("")
  return lines.join("\n")
}

const problems = []
for (const file of ROOTS.flatMap((root) => sourceFiles(root))) {
  let text = readFileSync(file, "utf8")
  if (write && fixWhitespace(text) !== text) {
    text = fixWhitespace(text)
    writeFileSync(file, text)
  }
  if (!text.endsWith("\n") || text.endsWith("\n\n")) {
    problems.push(`${file}: end the file with exactly one newline`)
  }
  const script = SCRIPTS.has(path.extname(file))
  const lines = text.split("\n")
  lines.forEach((line, index) => {
    const where = `${file}:${index + 1}`
    const indent = /^ */.exec(line)[0].length
    if (line.includes("\t")) problems.push(`${where}: use spaces, not tabs`)
    if (/[ \t]+$/.test(line)) problems.push(`${where}: trailing whitespace`)
    if (line.length > MAX_WIDTH) problems.push(`${where}: longer than ${MAX_WIDTH} columns`)
    if (line.trim() && indent % 2 !== 0) problems.push(`${where}: odd indentation`)
    if (script && /;\s*$/.test(line) && !/^\s*for \(/.test(line)) {
      problems.push(`${where}: no semicolons at the end of statements`)
    }
  })
}

if (problems.length) {
  console.error(problems.join("\n"))
  console.error(`\n${problems.length} formatting problem(s).${write ? "" : " Run pnpm format."}`)
  process.exit(1)
}
console.log("Formatting OK.")

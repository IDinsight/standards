// Repository lint rules, run in CI with `pnpm lint`. See README.md, Conventions.
import { readdirSync, readFileSync, statSync } from "node:fs"
import path from "node:path"

const SQL_KEYWORDS = [
  "SELECT", "FROM", "WHERE", "AND", "OR", "NOT", "NULL", "IS", "IN", "AS", "ON",
  "JOIN", "LEFT", "RIGHT", "INNER", "OUTER", "FULL", "CROSS", "USING", "GROUP", "ORDER",
  "BY", "HAVING", "LIMIT", "OFFSET", "ASC", "DESC", "DISTINCT", "CASE", "WHEN", "THEN",
  "ELSE", "END", "LIKE", "ILIKE", "COALESCE", "COUNT", "SUM", "INSERT", "INTO", "VALUES",
  "UPDATE", "SET", "DELETE", "RETURNING", "WITH", "UNION", "ALL", "EXISTS", "BETWEEN",
  "CAST", "TRUE", "FALSE",
]
const UPPERCASE_KEYWORD = new RegExp("\\b(" + SQL_KEYWORDS.join("|") + ")\\b")

function files(dir, extensions) {
  let entries = []
  try {
    entries = readdirSync(dir)
  } catch {
    return []
  }
  return entries.sort().flatMap((name) => {
    const full = path.join(dir, name)
    if (statSync(full).isDirectory()) return files(full, extensions)
    return extensions.includes(path.extname(name)) ? [full] : []
  })
}

const problems = []
const report = (file, line, message) => problems.push(`${file}:${line}: ${message}`)

for (const file of files("lib/sql", [".sql"])) {
  readFileSync(file, "utf8").split("\n").forEach((raw, index) => {
    const line = raw.replace(/--.*$/, "").replace(/'(?:[^']|'')*'/g, "''")
    const keyword = UPPERCASE_KEYWORD.exec(line)
    if (keyword) report(file, index + 1, `use lowercase SQL keywords (found ${keyword[1]})`)
    if (/\bselect\s+\*/i.test(line) || /^\s*\*,?\s*$/.test(line)) {
      report(file, index + 1, "list columns explicitly instead of select *")
    }
  })
}

const sources = [...files("app", [".ts", ".tsx"]), ...files("lib", [".ts", ".tsx"])]
for (const file of sources) {
  const text = readFileSync(file, "utf8")
  text.split("\n").forEach((line, index) => {
    if (/\bconsole\.log\(/.test(line)) report(file, index + 1, "remove console.log")
    if (/:\s*any\b|\bas any\b|<any>/.test(line)) report(file, index + 1, "do not use any")
    if (/\.query(<[^>]*>)?\(\s*`/.test(line)) {
      report(file, index + 1, "keep SQL in lib/sql/*.sql and load it with loadSql()")
    }
  })
  if (path.basename(file) === "page.tsx" && /^\s*["']use client["']/m.test(text)) {
    report(file, 1, "pages are server components; put client code in its own component")
  }
}

if (problems.length) {
  console.error(problems.join("\n"))
  console.error(`\n${problems.length} lint problem(s).`)
  process.exit(1)
}
console.log("Lint OK.")

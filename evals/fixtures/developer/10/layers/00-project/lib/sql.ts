import { readFileSync } from "node:fs"
import path from "node:path"

const cache = new Map<string, string>()

export function loadSql(name: string): string {
  let text = cache.get(name)
  if (text === undefined) {
    text = readFileSync(path.join(process.cwd(), "lib", "sql", `${name}.sql`), "utf8")
    cache.set(name, text)
  }
  return text
}

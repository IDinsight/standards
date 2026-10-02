import { readFileSync } from "node:fs";
import { SITE_BASE } from "./versions.mjs";

export function getVersionContext() {
  if (process.env.STANDARDS_DOCS_CONTEXT) {
    return JSON.parse(readFileSync(process.env.STANDARDS_DOCS_CONTEXT, "utf8"));
  }
  // Local commands preview the working tree without a published version label.
  return {
    currentVersion: null,
    currentBase: SITE_BASE,
    versions: [],
  };
}

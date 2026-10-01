import { readFileSync } from "node:fs";
import { SITE_BASE } from "./versions.mjs";

export function getVersionContext() {
  if (process.env.STANDARDS_DOCS_CONTEXT) {
    return JSON.parse(readFileSync(process.env.STANDARDS_DOCS_CONTEXT, "utf8"));
  }
  // Ordinary development/build commands render the working tree as Next.
  return {
    currentVersion: "next",
    currentBase: SITE_BASE,
    versions: [{
      id: "next",
      label: "Next (unreleased)",
      kind: "development",
      base: SITE_BASE,
    }],
  };
}

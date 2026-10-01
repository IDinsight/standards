export const SITE_BASE = "/standards/";
export const MINIMUM_VERSION = "0.7.4";

function numbers(version) {
  return version.split(".").map(Number);
}

function compare(left, right) {
  const a = numbers(left);
  const b = numbers(right);
  return a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
}

// Release tags are the content source; prereleases and unsupported early releases are omitted.
export function releaseVersions(tags) {
  const releases = [...new Set(tags)]
    .filter((tag) => /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(tag))
    .map((tag) => tag.slice(1))
    .filter((version) => compare(version, MINIMUM_VERSION) >= 0)
    .sort((left, right) => compare(right, left));
  if (!releases.length) {
    throw new Error("No supported documentation release tags found. Fetch tags before building.");
  }
  return releases.map((id, index) => ({
    id,
    label: "v" + id + (index === 0 ? " (latest)" : ""),
    kind: "release",
    base: index === 0 ? SITE_BASE : SITE_BASE + "v/" + id + "/",
    archiveBase: SITE_BASE + "v/" + id + "/",
    latest: index === 0,
  }));
}

// Use a built page inventory, rather than guessing that a historical page exists.
export function resolveVersionTarget(versions, sourceBase, targetId, currentUrl) {
  const target = versions.find((version) => version.id === targetId);
  if (!target) throw new Error("Unknown documentation version: " + targetId);
  const current = new URL(currentUrl);
  const prefix = sourceBase.replace(/\/?$/, "/");
  const route = current.pathname.startsWith(prefix)
    ? current.pathname.slice(prefix.length)
    : "";
  const found = Object.hasOwn(target.pages, route);
  const destination = new URL(target.base + (found ? route : ""), current.origin);
  if (found) {
    destination.search = current.search;
    try {
      const anchor = decodeURIComponent(current.hash.slice(1));
      if (anchor && target.pages[route].includes(anchor)) destination.hash = current.hash;
    } catch {
      // A malformed fragment does not prevent changing documentation versions.
    }
  }
  return destination.href;
}

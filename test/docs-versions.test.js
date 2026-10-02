import assert from "node:assert/strict";
import test from "node:test";

import { releaseVersions, resolveVersionTarget } from "../docs/src/versioning/versions.mjs";

test("docs releases sort numerically and include only supported stable tags", () => {
  const versions = releaseVersions([
    "v0.7.3", "v0.7.4", "v0.8.0", "v0.10.0", "v0.9.0", "v0.10.0",
    "v1.0.0-rc.1", "latest", "v01.0.0", "v2.0.0",
  ]);
  assert.deepEqual(versions.map((version) => version.id), ["2.0.0", "0.10.0", "0.9.0", "0.8.0", "0.7.4"]);
  assert.equal(versions[0].base, "/standards/");
  assert.equal(versions[0].archiveBase, "/standards/v/2.0.0/");
  assert.equal(versions[1].base, "/standards/v/0.10.0/");
  assert.throws(() => releaseVersions(["v0.7.3", "v0.8.0-beta.1"]), /Fetch tags/);
});

const versions = [
  { id: "0.8.0", base: "/standards/", pages: { "": [], "guides/working-with-developer/": ["choose-when-tester-runs"], "new-page/": [] } },
  { id: "0.7.4", base: "/standards/v/0.7.4/", pages: { "": [], "guides/working-with-developer/": ["approve-the-plan"] } },
];

test("switching versions preserves existing pages and only valid fragments", () => {
  const source = "https://idinsight.github.io/standards/guides/working-with-developer/?q=plan#approve-the-plan";
  assert.equal(resolveVersionTarget(versions, "/standards/", "0.7.4", source),
    "https://idinsight.github.io/standards/v/0.7.4/guides/working-with-developer/?q=plan#approve-the-plan");
  assert.equal(resolveVersionTarget(versions, "/standards/", "0.7.4", source.replace("approve-the-plan", "choose-when-tester-runs")),
    "https://idinsight.github.io/standards/v/0.7.4/guides/working-with-developer/?q=plan");
  assert.equal(resolveVersionTarget(versions, "/standards/v/0.7.4/", "0.8.0",
    "https://idinsight.github.io/standards/v/0.7.4/guides/working-with-developer/#choose-when-tester-runs"),
  "https://idinsight.github.io/standards/guides/working-with-developer/#choose-when-tester-runs");
});

test("a missing page falls back to the selected version overview", () => {
  assert.equal(resolveVersionTarget(versions, "/standards/", "0.7.4",
    "https://idinsight.github.io/standards/new-page/?q=test#new"),
  "https://idinsight.github.io/standards/v/0.7.4/");
  assert.equal(resolveVersionTarget(versions, "/standards/v/0.8.0/", "0.8.0",
    "https://idinsight.github.io/standards/v/0.8.0/"),
  "https://idinsight.github.io/standards/");
  assert.equal(resolveVersionTarget(versions, "/standards/", "0.7.4",
    "https://idinsight.github.io/standards-other/new-page/"),
  "https://idinsight.github.io/standards/v/0.7.4/");
  assert.throws(() => resolveVersionTarget(versions, "/standards/", "unknown",
    "https://idinsight.github.io/standards/"), /Unknown documentation version/);
});

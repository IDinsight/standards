import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
  site: "https://idinsight.github.io",
  base: "/standards",
  integrations: [
    starlight({
      title: "S.T.A.N.D.A.R.D.S.",
      description:
        "A framework for coding with agents: explicit roles, persisted work, and verifiable handoffs.",
      favicon: "/favicon.svg",
      customCss: ["./src/styles/custom.css"],
      sidebar: [
        {
          label: "Overview",
          slug: "index",
        },
        {
          label: "Getting Started",
          collapsed: false,
          items: [
            {
              slug: "getting-started/introduction",
            },
            {
              slug: "getting-started/installation",
            },
            {
              slug: "getting-started/first-workflow",
            },
          ],
        },
        {
          label: "Concepts",
          collapsed: true,
          items: [
            {
              slug: "concepts/ownership",
            },
            {
              slug: "concepts/project-modes",
            },
            {
              slug: "concepts/states-and-handoffs",
            },
            {
              slug: "concepts/acceptance-traceability",
            },
            {
              slug: "concepts/recovery",
            },
            {
              slug: "concepts/human-decisions",
            },
          ],
        },
        {
          label: "Roles",
          collapsed: false,
          items: [
            {
              slug: "roles/overview",
            },
            {
              slug: "roles/scoper",
            },
            {
              slug: "roles/tester",
            },
            {
              slug: "roles/architect",
            },
            {
              slug: "roles/navigator",
            },
            {
              slug: "roles/developer",
            },
            {
              slug: "roles/auditor",
            },
            {
              slug: "roles/reviewer",
            },
            {
              slug: "roles/documenter",
            },
            {
              slug: "roles/synchronizer",
            },
          ],
        },
        {
          label: "Guides",
          collapsed: true,
          items: [
            {
              slug: "guides/starting-a-cycle",
            },
            {
              slug: "guides/new-project",
            },
            {
              slug: "guides/existing-project",
            },
            {
              slug: "guides/working-with-developer",
            },
            {
              slug: "guides/revising-scope-or-design",
            },
            {
              slug: "guides/resuming-work",
            },
            {
              slug: "guides/review-findings",
            },
            {
              slug: "guides/cancelling-and-new-cycles",
            },
          ],
        },
        {
          label: "Reference",
          collapsed: true,
          items: [
            {
              slug: "reference/protocol",
            },
            {
              slug: "reference/runtime-files",
            },
            {
              slug: "reference/artifact-templates",
            },
            {
              slug: "reference/glossary",
            },
          ],
        },
        {
          label: "Contributing",
          collapsed: true,
          items: [
            {
              slug: "contributing/repository-structure",
            },
            {
              slug: "contributing/local-development",
            },
            {
              slug: "contributing/documentation",
            },
          ],
        },
      ],
    }),
  ],
});

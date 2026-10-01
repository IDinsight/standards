import starlight from "@astrojs/starlight";

export default function versionedStarlight(options) {
  // Roadmap is current project information, shared across release snapshots.
  const sidebar = [...options.sidebar];
  if (!sidebar.some((item) => item.slug === "roadmap")) {
    const roles = sidebar.findIndex((item) => item.label === "Roles");
    sidebar.splice(roles + 1, 0, { label: "Roadmap", slug: "roadmap" });
  }
  return starlight({
    ...options,
    sidebar,
    components: {
      ...options.components,
      SocialIcons: "./src/components/VersionSocialIcons.astro",
      Banner: "./src/components/VersionBanner.astro",
      Head: "./src/components/VersionHead.astro",
    },
  });
}

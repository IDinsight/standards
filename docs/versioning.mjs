import starlight from "@astrojs/starlight";

export default function versionedStarlight(options) {
  return starlight({
    ...options,
    components: {
      ...options.components,
      SocialIcons: "./src/components/VersionSocialIcons.astro",
      Banner: "./src/components/VersionBanner.astro",
      Head: "./src/components/VersionHead.astro",
    },
  });
}

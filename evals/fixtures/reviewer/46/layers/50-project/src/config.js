export function loadConfig(env = process.env) {
  return { archiveDir: env.ARCHIVE_DIR || './var/archive' };
}

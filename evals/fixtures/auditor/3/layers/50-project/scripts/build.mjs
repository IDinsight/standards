// Copy each workspace's src/ to dist/, which is what its package.json "main" points at.
import { cp, readdir, rm } from 'node:fs/promises';

for (const group of ['services', 'packages']) {
  const groupDir = new URL('../' + group + '/', import.meta.url);
  for (const name of await readdir(groupDir)) {
    const dir = new URL(name + '/', groupDir);
    await rm(new URL('dist/', dir), { recursive: true, force: true });
    await cp(new URL('src/', dir), new URL('dist/', dir), { recursive: true });
  }
}

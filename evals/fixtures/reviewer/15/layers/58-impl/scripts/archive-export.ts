// Uploads the records list to the document archive. Operations runs it every
// hour with `pnpm --filter export archive-export`.
import { createApp } from '../src/app.ts';
import { createHttpArchiveClient } from '../src/archive/client.ts';
import { runArchiveExport } from '../src/archive/job.ts';

const baseUrl = process.env.ARCHIVE_URL;
const token = process.env.ARCHIVE_TOKEN;
if (!baseUrl || !token) {
  console.error('archive-export: ARCHIVE_URL and ARCHIVE_TOKEN must be set');
  process.exit(2);
}

try {
  const result = await runArchiveExport({
    store: createApp().store,
    archive: createHttpArchiveClient({ baseUrl, token }),
    retry: {
      onRetry: (attempt, error, delayMs) => {
        console.error(`archive-export: attempt ${attempt} failed (${error.message}); retrying in ${delayMs} ms`);
      },
    },
  });
  console.log(`archive-export: uploaded ${result.fileName} (${result.records} records, ${result.attempts} attempt(s))`);
} catch (error) {
  console.error(`archive-export: upload failed: ${(error as Error).message}`);
  process.exitCode = 1;
}

import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';

export async function* readNdjson(path) {
  const lines = createInterface({ input: createReadStream(path, 'utf8'), crlfDelay: Infinity });
  let lineNumber = 0;
  for await (const line of lines) {
    lineNumber += 1;
    if (!line.trim()) continue;
    try {
      yield JSON.parse(line);
    } catch {
      throw new Error(`${path}:${lineNumber}: invalid JSON`);
    }
  }
}

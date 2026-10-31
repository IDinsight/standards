// Reads a text/event-stream body and yields the data field of each event.
export async function* readServerSentEvents(body: ReadableStream<Uint8Array>): AsyncGenerator<string> {
  const reader = body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = '';
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += value;
      let boundary = buffer.search(/\r?\n\r?\n/);
      while (boundary !== -1) {
        const data = dataOf(buffer.slice(0, boundary));
        buffer = buffer.slice(boundary).replace(/^\r?\n\r?\n/, '');
        if (data !== null) yield data;
        boundary = buffer.search(/\r?\n\r?\n/);
      }
    }
    const rest = dataOf(buffer);
    if (rest !== null) yield rest;
  } finally {
    reader.releaseLock();
  }
}

function dataOf(block: string): string | null {
  const lines = block.split(/\r?\n/).filter((line) => line.startsWith('data:'));
  if (lines.length === 0) return null;
  return lines.map((line) => line.slice(5).replace(/^ /, '')).join('\n');
}

// Parse time entries from CSV text: `date, project, minutes` per line.
export function parseEntries(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const [date, project, minutes] = line.split(',').map((part) => part.trim());
      return { date, project, minutes: Number(minutes) };
    });
}

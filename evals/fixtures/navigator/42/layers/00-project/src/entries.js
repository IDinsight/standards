const HEADER = 'date,project,hours';

export function parseEntries(text) {
  const [header = '', ...lines] = text.trim().split(/\r?\n/);
  if (header.trim() !== HEADER) throw new Error(`unexpected header: ${header}`);
  const entries = [];
  lines.forEach((line, index) => {
    if (!line.trim()) return;
    const [date, project, hours] = line.split(',').map((cell) => cell.trim());
    const value = Number(hours);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date ?? '') || !project || hours === '' || !Number.isFinite(value)) {
      throw new Error(`line ${index + 2}: expected ${HEADER}`);
    }
    entries.push({ date, project, hours: value });
  });
  return entries;
}

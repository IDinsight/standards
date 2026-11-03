// Parse a timesheet CSV export into { name, hours } entries.
export function parseCsv(text) {
  const lines = text.split(/\r?\n/);
  const headerIndex = lines.findIndex((line) => line.trim() !== '');
  if (headerIndex === -1) return [];
  const header = lines[headerIndex].split(',').map((cell) => cell.trim());
  const nameColumn = header.indexOf('name');
  const hoursColumn = header.indexOf('hours');
  if (nameColumn === -1 || hoursColumn === -1) {
    throw new Error('CSV header must include name and hours columns');
  }
  const entries = [];
  for (let index = headerIndex + 1; index < lines.length; index += 1) {
    if (lines[index].trim() === '') continue;
    const cells = lines[index].split(',').map((cell) => cell.trim());
    const name = cells[nameColumn] ?? '';
    const rawHours = cells[hoursColumn] ?? '';
    if (name === '') throw new Error(`Line ${index + 1}: name is empty`);
    const hours = rawHours === '' ? Number.NaN : Number(rawHours);
    if (!Number.isFinite(hours)) throw new Error(`Line ${index + 1}: hours is not a number`);
    entries.push({ name, hours });
  }
  return entries;
}

// Add up hours per person, sorted by name.
export function summarize(entries) {
  const totals = new Map();
  for (const { name, hours } of entries) totals.set(name, (totals.get(name) ?? 0) + hours);
  return [...totals]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([name, hours]) => ({ name, hours }));
}

export function formatTable(rows) {
  return rows.map(({ name, hours }) => `${name}: ${hours.toFixed(2)}`).join('\n');
}

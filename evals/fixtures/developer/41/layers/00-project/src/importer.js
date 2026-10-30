export function parseRows(text) {
  const [headerLine, ...lines] = text.split(/\r?\n/);
  const header = headerLine.split(',');
  return lines.map((line) => {
    const cells = line.split(',');
    return Object.fromEntries(header.map((name, index) => [name, cells[index] ?? '']));
  });
}

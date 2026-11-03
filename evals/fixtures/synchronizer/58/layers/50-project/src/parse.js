const HEADER = ['date', 'description', 'amount'];

// Parses a bank statement export with the columns date,description,amount.
// Amounts are returned in integer cents.
export function parseStatement(text) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== '');
  if (lines.length === 0) return [];
  const header = lines[0].split(',').map((cell) => cell.trim().toLowerCase());
  if (header.join(',') !== HEADER.join(',')) {
    throw new Error(`unexpected header: ${lines[0]}`);
  }
  return lines.slice(1).map((line, index) => {
    const fields = line.split(',');
    const amount = Number(fields[2]);
    if (fields.length !== 3 || !/^\d{4}-\d{2}-\d{2}$/.test(fields[0]) || fields[2].trim() === '' || Number.isNaN(amount)) {
      throw new Error(`line ${index + 2}: cannot read "${line}"`);
    }
    return { date: fields[0], description: fields[1].trim(), amount: Math.round(amount * 100) };
  });
}

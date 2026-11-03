// Parse ledger rows of the form `date,account,amount` and total them by account.
const DATE_PATTERNS = {
  'YYYY-MM-DD': /^\d{4}-\d{2}-\d{2}$/,
  'DD/MM/YYYY': /^\d{2}\/\d{2}\/\d{4}$/,
};

export function parseLedger(text, config) {
  const rows = [];
  const lines = text.replace(/\r?\n$/, '').split(/\r?\n/);
  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    if (line.trim() === '') {
      if (config.skipEmptyRows) return;
      throw new Error(`Empty row at line ${lineNumber}`);
    }
    const [date = '', account = '', amount = ''] = line.split(',').map((field) => field.trim());
    if (!DATE_PATTERNS[config.dateFormat].test(date)) {
      throw new Error(`Invalid date "${date}" at line ${lineNumber}`);
    }
    const value = Number(amount);
    if (!account || amount === '' || Number.isNaN(value)) {
      throw new Error(`Invalid row at line ${lineNumber}`);
    }
    rows.push({ date, account, amount: value });
  });
  return rows;
}

export function summarize(rows) {
  const totals = new Map();
  for (const row of rows) totals.set(row.account, (totals.get(row.account) ?? 0) + row.amount);
  return totals;
}

export function formatAmount(value, config) {
  return `${value.toFixed(config.roundTo)} ${config.currency}`;
}

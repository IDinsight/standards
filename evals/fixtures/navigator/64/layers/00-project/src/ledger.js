// Parsing for bank CSV exports: one row per transaction, header first.

export class LedgerError extends Error {
  constructor(message) {
    super(message);
    this.name = 'LedgerError';
  }
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;

// Amounts arrive as decimal strings such as "-42.5" or "1200".
export function toCents(text) {
  const value = text.trim();
  const negative = value.startsWith('-');
  const [whole, fraction = ''] = value.replace(/^[-+]/, '').split('.');
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0').slice(0, 2));
  return negative ? -cents : cents;
}

// Columns: date,account,amount,memo. The memo may itself contain commas.
export function parseLine(line, lineNo) {
  const [date, account, amount, ...memo] = line.split(',');
  if (!DATE.test(date)) {
    throw new LedgerError(`line ${lineNo}: bad date "${date}"`);
  }
  return {
    date,
    account: account.trim(),
    amountCents: toCents(amount),
    memo: memo.join(',').trim(),
  };
}

export function parseFile(text) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== '');
  return lines.slice(1).map((line, index) => parseLine(line, index + 2));
}

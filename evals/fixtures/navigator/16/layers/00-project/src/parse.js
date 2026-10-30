export function parseInvoices(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const [id, customer, amount] = line.split(',').map((part) => part.trim());
      const value = Number(amount);
      if (!id || !customer || amount === undefined || Number.isNaN(value)) {
        throw new Error(`Invalid invoice line: ${line}`);
      }
      return { id, customer, amount: value };
    });
}

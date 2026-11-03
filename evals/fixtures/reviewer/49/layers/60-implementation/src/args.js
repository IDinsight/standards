const DATE = /^\d{4}-\d{2}-\d{2}$/;

// Parse `report [--since YYYY-MM-DD] <file>`.
export function parseArgs(argv) {
  let file = null;
  let since;
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--since') {
      const value = argv[(index += 1)];
      if (!value || !isDate(value)) return { error: `invalid --since date: ${value ?? '(missing)'}` };
      since = value;
    } else if (file === null) {
      file = arg;
    } else {
      return { error: `unexpected argument: ${arg}` };
    }
  }
  if (file === null) return { error: 'usage: report [--since YYYY-MM-DD] <file>' };
  return { file, since };
}

function isDate(value) {
  if (!DATE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value);
}

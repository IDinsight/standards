const COLUMNS = ['date', 'site', 'visitor', 'notes'];

function cell(value) {
  const text = value == null ? '' : String(value);
  if (!/[",\n]/.test(text)) return text;
  return '"' + text.replaceAll('"', '""') + '"';
}

export function toCsv(visits) {
  const lines = visits.map((visit) => COLUMNS.map((key) => cell(visit[key])).join(','));
  return [COLUMNS.join(','), ...lines].join('\n');
}
